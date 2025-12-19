import { Node, mergeAttributes } from "@tiptap/core";
import ReactDOM from "react-dom/client";
import { QuizCardModal } from "../QuizCardModal";

export interface QuizCardOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    quizCard: {
      /**
       * Insert a quiz card
       */
      setQuizCard: (options: {
        pillarId?: string;
        subPageId?: string;
        nestedSubPageId?: string;
        topicId?: string;
        quizId?: string;
        quizTitle?: string;
        selectedQuestionIds?: string[];
      }) => ReturnType;
    };
  }
}

export const QuizCard = Node.create<QuizCardOptions>({
  name: "quizCard",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  defining: true,

  atom: true,

  addAttributes() {
    return {
      pillarId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-pillar-id"),
        renderHTML: (attributes) => {
          if (!attributes.pillarId) {
            return {};
          }
          return {
            "data-pillar-id": attributes.pillarId,
          };
        },
      },
      subPageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-sub-page-id"),
        renderHTML: (attributes) => {
          if (!attributes.subPageId) {
            return {};
          }
          return {
            "data-sub-page-id": attributes.subPageId,
          };
        },
      },
      nestedSubPageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-nested-sub-page-id"),
        renderHTML: (attributes) => {
          if (!attributes.nestedSubPageId) {
            return {};
          }
          return {
            "data-nested-sub-page-id": attributes.nestedSubPageId,
          };
        },
      },
      topicId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-topic-id"),
        renderHTML: (attributes) => {
          if (!attributes.topicId) {
            return {};
          }
          return {
            "data-topic-id": attributes.topicId,
          };
        },
      },
      quizId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-quiz-id"),
        renderHTML: (attributes) => {
          if (!attributes.quizId) {
            return {};
          }
          return {
            "data-quiz-id": attributes.quizId,
          };
        },
      },
      quizTitle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-quiz-title"),
        renderHTML: (attributes) => {
          if (!attributes.quizTitle) {
            return {};
          }
          return {
            "data-quiz-title": attributes.quizTitle,
          };
        },
      },
      selectedQuestionIds: {
        default: null,
        parseHTML: (element) => {
          const ids = element.getAttribute("data-selected-question-ids");
          return ids ? JSON.parse(ids) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.selectedQuestionIds) {
            return {};
          }
          return {
            "data-selected-question-ids": JSON.stringify(attributes.selectedQuestionIds),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quiz-card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "quiz-card",
        class: "quiz-card-wrapper",
      }),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-type", "quiz-card");
      dom.className = "quiz-card-wrapper my-4";

      let root: ReactDOM.Root | null = null;

      const updateAttributes = (attrs: any) => {
        if (typeof getPos === "function") {
          const pos = getPos();
          if (pos !== null && pos !== undefined) {
            editor.commands.command(({ tr, state: _state }) => {
              const newAttrs = {
                ...node.attrs,
                ...attrs,
              };
              tr.setNodeMarkup(pos, undefined, newAttrs);
              return true;
            });
          }
        }
      };

      let isMounted = true;

      const safeRender = (component: React.ReactElement) => {
        if (!isMounted || !root) return;
        try {
          root.render(component);
        } catch (error) {
          console.error("Error rendering quiz card:", error);
        }
      };

      const render = () => {
        if (!root) {
          root = ReactDOM.createRoot(dom);
        }
        
        // Prevent editor from handling events inside the quiz card
        dom.addEventListener("mousedown", (e) => {
          e.stopPropagation();
        });
        dom.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        dom.addEventListener("keydown", (e) => {
          e.stopPropagation();
        });
        dom.addEventListener("keyup", (e) => {
          e.stopPropagation();
        });
        dom.addEventListener("keypress", (e) => {
          e.stopPropagation();
        });
        dom.addEventListener("input", (e) => {
          e.stopPropagation();
        });
        
        // If we have quiz data and not in edit mode, render the quiz
        if (!editor.isEditable && node.attrs.quizId && node.attrs.quizTitle) {
          import("../QuizCardRenderer").then(({ QuizCardRenderer }) => {
            if (!isMounted) return;
            // Load questions and render quiz
            import("@/lib/firestore-operations").then((ops) => {
              if (!isMounted) return;
              const loadAndRender = async () => {
                try {
                  let result;
                  const { pillarId, subPageId, nestedSubPageId, topicId, quizId, selectedQuestionIds } = node.attrs;
                  
                  if (pillarId === "nursing-entrance-exam") {
                    result = await ops.getNursingEntranceExamQuizQuestions(
                      subPageId,
                      nestedSubPageId,
                      quizId
                    );
                  } else if (pillarId === "nursing-test-bank") {
                    result = await ops.getNursingTestBankQuizQuestions(
                      subPageId,
                      nestedSubPageId,
                      topicId,
                      quizId
                    );
                  } else if (pillarId === "nursing-exit-exam") {
                    result = await ops.getNursingExitExamQuizQuestions(
                      subPageId,
                      nestedSubPageId,
                      quizId
                    );
                  } else {
                    // Show placeholder if pillar is not recognized
                    safeRender(
                      <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
                        <p className="text-gray-600">Quiz: {node.attrs.quizTitle || "Untitled Quiz"}</p>
                      </div>
                    );
                    return;
                  }

                  if (!isMounted) return;

                  if (result.success && result.data) {
                    let filteredQuestions = result.data.filter((q: any) => {
                      const typeId = q.questionTypeId || q.question_type_id;
                      return (
                        q.isCopyRight === true &&
                        (typeId === 1 || typeId === 2 || typeId === 3 || typeId === 7)
                      );
                    });

                    // Filter by selected question IDs if available
                    if (selectedQuestionIds && Array.isArray(selectedQuestionIds)) {
                      filteredQuestions = filteredQuestions.filter((q: any) =>
                        selectedQuestionIds.includes(q.id || q.questionId)
                      );
                    }

                    if (!isMounted) return;

                    if (filteredQuestions.length > 0) {
                      safeRender(
                        <QuizCardRenderer
                          questions={filteredQuestions}
                          quizTitle={node.attrs.quizTitle}
                          isEditable={false}
                        />
                      );
                    } else {
                      // Show placeholder if no questions found
                      safeRender(
                        <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
                          <p className="text-gray-600">Quiz: {node.attrs.quizTitle || "Untitled Quiz"}</p>
                          <p className="text-sm text-gray-500 mt-2">No questions available.</p>
                        </div>
                      );
                    }
                  } else {
                    // Show placeholder if loading failed
                    safeRender(
                      <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
                        <p className="text-gray-600">Quiz: {node.attrs.quizTitle || "Untitled Quiz"}</p>
                        <p className="text-sm text-gray-500 mt-2">Unable to load quiz questions.</p>
                      </div>
                    );
                  }
                } catch (err) {
                  console.error("Error loading quiz:", err);
                  if (!isMounted) return;
                  // Show error placeholder
                  safeRender(
                    <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
                      <p className="text-gray-600">Quiz: {node.attrs.quizTitle || "Untitled Quiz"}</p>
                      <p className="text-sm text-red-500 mt-2">Error loading quiz questions.</p>
                    </div>
                  );
                }
              };
              loadAndRender();
            });
          });
          return;
        }
        
        // In read-only mode but no quiz data, show placeholder
        if (!editor.isEditable) {
          safeRender(
            <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
              <p className="text-gray-600">Quiz Card</p>
              <p className="text-sm text-gray-500 mt-2">Quiz not configured.</p>
            </div>
          );
          return;
        }

        // In edit mode, render the form directly in the editor
        safeRender(
          <QuizCardModal
            initialData={node.attrs}
            onSave={(data) => {
              updateAttributes(data);
            }}
            isEditable={editor.isEditable}
          />
        );
      };

      render();

      // Re-render when node attributes change
      const update = (updatedNode: any) => {
        // Update the node reference with new attributes
        if (updatedNode) {
          node = updatedNode;
        }
        // Re-render with updated attributes
        render();
        return true;
      };

      return {
        dom,
        update,
        destroy: () => {
          isMounted = false;
          // Use setTimeout to avoid unmounting during render
          setTimeout(() => {
            if (root) {
              try {
                root.unmount();
              } catch (_error) {
                // Ignore unmount errors during cleanup
              }
              root = null;
            }
          }, 0);
        },
      };
    };
  },

  addCommands() {
    return {
      setQuizCard:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              pillarId: options.pillarId || null,
              subPageId: options.subPageId || null,
              nestedSubPageId: options.nestedSubPageId || null,
              topicId: options.topicId || null,
              quizId: options.quizId || null,
              quizTitle: options.quizTitle || null,
              selectedQuestionIds: options.selectedQuestionIds || null,
            },
          });
        },
    };
  },
});

