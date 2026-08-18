const fs = require("fs");

const CLEANUP_ROOT =
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\LPN\\ATI";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function optionsJson(options) {
  return JSON.stringify(options);
}

function repairMissingQuestionText() {
  const filePath = `${CLEANUP_ROOT}\\Adult Medical Surgical\\50-ATI PN Adult Medical Surgical 2023 Proctored Exam.json`;
  const data = readJson(filePath);
  const question = data.questions.find((item) => String(item.id) === "50705");
  if (!question) throw new Error("Question 50705 not found");

  question.question =
    "<p><strong>A nurse is providing dietary education to a client with HIV who has been experiencing nausea and a decreased appetite. Which of the following dietary recommendations is most appropriate for this client?</strong></p>";
  question.question_slug =
    "a-nurse-is-providing-dietary-education-to-a-client-with-hiv-who-has-nausea";

  writeJson(filePath, data);
  return {
    filePath,
    sourceQuestionId: question.id,
    repaired: "missing_question_text",
  };
}

function repairEmptyOptions() {
  const filePath = `${CLEANUP_ROOT}\\Adult Medical Surgical\\21-ATI PN Medical Surgical Proctored Exam 2023.json`;
  const data = readJson(filePath);
  const question = data.questions.find((item) => String(item.id) === "59246304");
  if (!question) throw new Error("Question 59246304 not found");

  question.options = optionsJson({
    A: {
      choice: "Unable to remain fully awake while answering questions.",
      reason:
        "<p>Inability to remain fully awake after head trauma indicates decreased neurological function and possible intracranial injury. This is the priority finding.</p>",
    },
    B: {
      choice: "Unable to repeat the names of three common objects the nurse names.",
      reason:
        "<p>Difficulty repeating named objects can indicate short-term memory impairment, but it is not as immediately urgent as decreased level of consciousness.</p>",
    },
    C: {
      choice: "Unable to remember their adult children's names.",
      reason:
        "<p>Failure to recall family members can indicate memory impairment, but it is not the priority compared with reduced alertness after head trauma.</p>",
    },
    D: {
      choice: "Unable to answer a judgment question correctly.",
      reason:
        "<p>Difficulty with judgment can indicate cognitive impairment, but decreased alertness is the priority finding after a fall with head injury.</p>",
    },
  });

  writeJson(filePath, data);
  return {
    filePath,
    sourceQuestionId: question.id,
    repaired: "empty_options",
  };
}

const repairs = [repairMissingQuestionText(), repairEmptyOptions()];
console.log(JSON.stringify({ repairs }, null, 2));
