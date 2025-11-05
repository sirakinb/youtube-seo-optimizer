"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Calendar, FileText } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/history");

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E6EAF0]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#3C4046] hover:text-[#111318] hover:bg-[#F8F9FC] rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </a>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="font-extrabold text-xl text-[#111318]">
                  History
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#3C4046]">Loading history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E6EAF0] p-12 text-center">
            <div className="w-16 h-16 bg-[#F8F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-[#3C4046]" />
            </div>
            <h3 className="font-bold text-lg text-[#111318] mb-2">
              No History Yet
            </h3>
            <p className="text-sm text-[#3C4046] mb-4">
              Your saved content will appear here
            </p>
            <a
              href="/"
              className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Generate Content
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="lg:col-span-1 space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedItem?.id === item.id
                      ? "border-[#7C3AED] bg-[#F3E8FF]"
                      : "border-[#E6EAF0] bg-white hover:border-[#7C3AED]"
                  }`}
                >
                  <h4 className="font-semibold text-sm text-[#111318] mb-2 line-clamp-2">
                    {item.final_video_title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-[#3C4046]">
                    <Calendar size={12} />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="space-y-6">
                  {/* Video Title */}
                  <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                    <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                      Video Title
                    </h3>
                    <p className="text-sm text-[#111318]">
                      {selectedItem.final_video_title}
                    </p>
                  </div>

                  {/* Thumbnail Title */}
                  <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                    <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                      Thumbnail Title
                    </h3>
                    <p className="text-sm text-[#111318]">
                      {selectedItem.final_thumbnail_title}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                    <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                      Video Description
                    </h3>
                    <p className="text-sm text-[#111318] whitespace-pre-wrap">
                      {selectedItem.final_description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                    <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.final_tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#F8F9FC] text-[#111318] text-sm rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="bg-white rounded-xl border border-[#E6EAF0] p-6">
                    <h3 className="font-bold text-lg text-[#111318] mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></span>
                      Original Transcript
                    </h3>
                    <p className="text-sm text-[#3C4046] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {selectedItem.transcript}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E6EAF0] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F8F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-[#3C4046]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#111318] mb-2">
                    Select an Item
                  </h3>
                  <p className="text-sm text-[#3C4046]">
                    Choose a saved result from the list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
