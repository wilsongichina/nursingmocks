"use client";

import { useState, useEffect } from "react";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import TawkToChat from "@/components/ui/TawkToChat";
import TiptapEditor from "@/components/editor/TiptapEditor";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
} from "firebase/firestore";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const STORAGE_KEY = "tiptap-editor-content";

export default function TipTapEditorPage() {
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState("");

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Auto-save to localStorage
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    localStorage.setItem(STORAGE_KEY, newContent);
  };

  // Save content to Firebase
  const handleSaveToFirebase = async () => {
    if (!content.trim()) {
      setSaveStatus("error");
      setSaveMessage("Cannot save empty content");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 3000);
      return;
    }

    setSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      const docRef = await addDoc(collection(db, "tiptap-test"), {
        content: content,
        htmlContent: content, // Store the HTML content
        createdAt: new Date().toISOString(),
        timestamp: new Date(),
      });

      setSaveStatus("success");
      setSaveMessage(`Content saved successfully! Document ID: ${docRef.id}`);
      setSaving(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 5000);
    } catch (error: any) {
      console.error("Error saving content to Firebase:", error);
      setSaveStatus("error");
      setSaveMessage(`Failed to save: ${error.message}`);
      setSaving(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif] text-[#111827] flex flex-col">
      <NewHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <section className="max-w-[1320px] mx-auto w-[94%] py-[42px] pb-[30px]">
          <div className="max-w-[980px] mx-auto">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#4f46e5] flex gap-[10px] items-center flex-wrap mb-2">
              <span className="px-[10px] py-1 rounded-full border border-[#c4b5fd] bg-[rgba(255,255,255,0.7)] text-[#4c1d95]">
                Rich Text Editor
              </span>
              <span>Powered by Tiptap</span>
            </div>
            <h1 className="text-[clamp(30px,3.4vw,38px)] m-0 mb-[10px] leading-[1.08] font-bold">
              Tiptap Rich Text Editor
            </h1>
            <p className="text-[15px] max-w-[780px] text-[#4b5563] leading-[1.7] m-0 mb-[14px]">
              A powerful, extensible rich text editor built with Tiptap. Create
              and format your content with ease. Your work is automatically
              saved to your browser.
            </p>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-[30px] pb-10 flex justify-center max-w-[1320px] w-[94%] mx-auto">
        <section className="w-full max-w-[980px]">
          <div className="bg-white rounded-[22px] border border-[#e5e7eb] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            {/* Save Button */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                {saveStatus === "success" && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saveMessage}</span>
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{saveMessage}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveToFirebase}
                disabled={saving || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save to Firebase</span>
                  </>
                )}
              </button>
            </div>

            {/* Editor */}
            <TiptapEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Start typing your content here... Use the toolbar above to format your text."
            />

            {/* Info Section */}
            <div className="mt-6 p-4 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                    Ctrl+B
                  </kbd>{" "}
                  Bold
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                    Ctrl+I
                  </kbd>{" "}
                  Italic
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                    Ctrl+Z
                  </kbd>{" "}
                  Undo
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                    Ctrl+Y
                  </kbd>{" "}
                  Redo
                </div>
              </div>
            </div>

            {/* Saved Content Display */}
            <div className="mt-6">
              <TiptapContentRenderer content='<p>This is a <em>test</em> for a <s>brand-new</s> <a target="_blank" rel="noopener noreferrer nofollow" class="tiptap-link" href="/">editor.</a></p><p>Check the custom module</p><ul><li><p>This to <strong>check</strong></p></li><li><p>1</p></li><li><p>2</p></li></ul><p></p><ol><li><p>x</p></li><li><p>y</p></li><li><p>z</p></li></ol><h1>Test</h1><h2>Test</h2><h3>test</h3><p><code>12312</code></p><blockquote><p>21</p></blockquote><pre><code>1231313</code></pre><p></p><table style="min-width: 132px;"><colgroup><col style="width: 82px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="82"><p>Testing </p></th><th colspan="1" rowspan="1"><p>testin</p></th><th colspan="1" rowspan="1"><p>test</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="82"><p>12</p></td><td colspan="1" rowspan="1"><p>123</p></td><td colspan="1" rowspan="1"><p>1234</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="82"><p>1234</p></td><td colspan="1" rowspan="1"><p>1234</p></td><td colspan="1" rowspan="1"><p>1234</p></td></tr></tbody></table><p></p>' />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <NewFooter />

      {/* Floating buttons */}
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}
