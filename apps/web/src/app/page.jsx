"use client";

import { useState } from "react";
import {
  Sparkles,
  Save,
  History,
  BookOpen,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [transcript, setTranscript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [editedDescription, setEditedDescription] = useState("");
  const [editedThumbnailTitle, setEditedThumbnailTitle] = useState("");
  const [editedTags, setEditedTags] = useState("");
  // NEW: editable title options
  const [editedTitleOptions, setEditedTitleOptions] = useState([]);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError("Please paste a transcript first");
      return;
    }

    setError("");
    setGenerating(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        // IMPROVED: surface server error details if available
        let detail = "";
        try {
          const problem = await response.json();
          if (problem?.error) {
            detail = `${problem.error}${problem.detail ? ` - ${problem.detail}` : ""}`;
          } else {
            detail = `When fetching /api/generate-content, the response was [${response.status}] ${response.statusText}`;
          }
        } catch (_) {
          detail = `When fetching /api/generate-content, the response was [${response.status}] ${response.statusText}`;
        }
        throw new Error(detail);
      }

      const data = await response.json();
      setGenerated(data);
      setSelectedTitle(0);
      setEditedDescription(data.description);
      setEditedThumbnailTitle(data.thumbnail_title);
      setEditedTags(data.tags);
      // NEW: initialize editable title options
      setEditedTitleOptions(
        Array.isArray(data.video_title_options) ? data.video_title_options : [],
      );
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;

    setSaving(true);
    setSaveSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/save-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: generated.id,
          transcript,
          finalDescription: editedDescription,
          finalThumbnailTitle: editedThumbnailTitle,
          // UPDATED: use possibly edited title option
          finalVideoTitle:
            (editedTitleOptions && editedTitleOptions[selectedTitle]) ||
            generated.video_title_options[selectedTitle],
          finalTags: editedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save results. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // NEW: handle editing individual title options
  const handleTitleChange = (index, value) => {
    setEditedTitleOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Helper to choose the list to render
  const titleOptionsToRender =
    editedTitleOptions && editedTitleOptions.length > 0
      ? editedTitleOptions
      : generated?.video_title_options || [];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E6EAF0]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* UPDATED color to purple */}
              <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-xl text-[#111318]">
                YouTube Content AI
              </span>
            </div>

            <nav className="flex items-center space-x-4">
              <a
                href="/history"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#111318] hover:bg-[#F8F9FC] rounded-lg transition-colors"
              >
                <History size={16} />
                <span>History</span>
              </a>
              <a
                href="/training"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#111318] hover:bg-[#F8F9FC] rounded-lg transition-colors"
              >
                <BookOpen size={16} />
                <span>Training Data</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div>
            <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
              <h2 className="font-extrabold text-2xl text-[#111318] mb-2">
                Video Transcript
              </h2>
              <p className="text-sm text-[#3C4046] mb-4">
                Paste your video transcript below and let AI generate
                SEO-optimized content
              </p>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your video transcript here..."
                className="w-full h-[400px] p-4 border border-[#E6EAF0] rounded-lg text-[#111318] placeholder:text-[#3C4046] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
              />

              <button
                onClick={handleGenerate}
                disabled={generating || !transcript.trim()}
                className="w-full mt-4 bg-[#111318] hover:bg-[#2A2D35] disabled:bg-[#E6EAF0] disabled:text-[#3C4046] text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Content</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <Check size={16} className="text-green-600" />
                  <p className="text-sm text-green-600 font-medium">
                    Results saved successfully!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            {generated ? (
              <div className="space-y-6">
                {/* Video Title Options */}
                <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                  <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                    {/* UPDATED dot color to purple */}
                    <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                    Video Title Options
                  </h3>
                  <p className="text-xs text-[#3C4046] mb-4">
                    Choose your favorite title and edit any of them
                  </p>

                  <div className="space-y-3">
                    {titleOptionsToRender.map((title, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTitle(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedTitle === index
                            ? "border-[#7C3AED] bg-[#F3E8FF]"
                            : "border-[#E6EAF0] hover:border-[#7C3AED] hover:bg-[#F8F9FC]"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              selectedTitle === index
                                ? "border-[#7C3AED] bg-[#7C3AED]"
                                : "border-[#E6EAF0]"
                            }`}
                          >
                            {selectedTitle === index && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          {/* UPDATED: editable input for each title option */}
                          <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                              handleTitleChange(index, e.target.value)
                            }
                            className="text-sm font-medium text-[#111318] flex-1 bg-transparent border border-transparent focus:border-[#E6EAF0] focus:ring-2 focus:ring-[#7C3AED] rounded-md px-2 py-1"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Title */}
                <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                  <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                    Thumbnail Title
                  </h3>
                  <textarea
                    value={editedThumbnailTitle}
                    onChange={(e) => setEditedThumbnailTitle(e.target.value)}
                    className="w-full h-20 p-4 border border-[#E6EAF0] rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                  />
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                  <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                    Video Description
                  </h3>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full h-48 p-4 border border-[#E6EAF0] rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                  <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                    Tags
                  </h3>
                  <textarea
                    value={editedTags}
                    onChange={(e) => setEditedTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full h-24 p-4 border border-[#E6EAF0] rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#E6EAF0] disabled:text-[#3C4046] text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Results</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E6EAF0] p-12 text-center">
                <div className="w-16 h-16 bg-[#F8F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-[#3C4046]" />
                </div>
                <h3 className="font-bold text-lg text-[#111318] mb-2">
                  No Content Yet
                </h3>
                <p className="text-sm text-[#3C4046]">
                  Paste your transcript and click generate to see AI-powered
                  content suggestions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
