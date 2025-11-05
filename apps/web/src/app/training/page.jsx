"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

export default function TrainingPage() {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    exampleType: "complete",
    title: "",
    description: "",
    tags: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/training");

      if (!response.ok) {
        throw new Error("Failed to load training examples");
      }

      const data = await response.json();
      setExamples(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load training examples. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add training example");
      }

      // Reset form and reload
      setFormData({
        exampleType: "complete",
        title: "",
        description: "",
        tags: "",
        notes: "",
      });
      setShowForm(false);
      loadExamples();
    } catch (err) {
      console.error(err);
      setError("Failed to add training example. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this training example?")) {
      return;
    }

    try {
      const response = await fetch(`/api/training?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete training example");
      }

      loadExamples();
    } catch (err) {
      console.error(err);
      setError("Failed to delete training example. Please try again.");
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      title: "Title Only",
      description: "Description Only",
      tags: "Tags Only",
      complete: "Complete Example",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      title: "bg-blue-100 text-blue-700",
      description: "bg-green-100 text-green-700",
      tags: "bg-purple-100 text-purple-700",
      // UPDATED from yellow to purple-ish chip
      complete: "bg-[#EDE9FE] text-[#4C1D95]",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
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
                {/* UPDATED to purple */}
                <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="font-extrabold text-xl text-[#111318]">
                  Training Data
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Example</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-sm text-blue-900 mb-2">
            How Training Data Works
          </h3>
          <p className="text-sm text-blue-700">
            Add examples of your previous successful YouTube content here. The
            AI will learn from these examples to better match your style, tone,
            and formatting preferences when generating new content.
          </p>
        </div>

        {/* Add Example Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#E6EAF0] p-6 mb-8">
            <h3 className="font-bold text-lg text-[#111318] mb-6">
              Add Training Example
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Example Type */}
              <div>
                <label className="block text-sm font-medium text-[#111318] mb-2">
                  Example Type
                </label>
                <select
                  value={formData.exampleType}
                  onChange={(e) =>
                    setFormData({ ...formData, exampleType: e.target.value })
                  }
                  className="w-full p-3 border border-[#E6EAF0] rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                >
                  <option value="complete">
                    Complete Example (Title, Description, Tags)
                  </option>
                  <option value="title">Title Only</option>
                  <option value="description">Description Only</option>
                  <option value="tags">Tags Only</option>
                </select>
              </div>

              {/* Title */}
              {(formData.exampleType === "title" ||
                formData.exampleType === "complete") && (
                <div>
                  <label className="block text-sm font-medium text-[#111318] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter a successful video title..."
                    className="w-full p-3 border border-[#E6EAF0] rounded-lg text-[#111318] placeholder:text-[#3C4046] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                  />
                </div>
              )}

              {/* Description */}
              {(formData.exampleType === "description" ||
                formData.exampleType === "complete") && (
                <div>
                  <label className="block text-sm font-medium text-[#111318] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter a successful video description..."
                    className="w-full h-32 p-3 border border-[#E6EAF0] rounded-lg text-[#111318] placeholder:text-[#3C4046] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Tags */}
              {(formData.exampleType === "tags" ||
                formData.exampleType === "complete") && (
                <div>
                  <label className="block text-sm font-medium text-[#111318] mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="tag1, tag2, tag3..."
                    className="w-full p-3 border border-[#E6EAF0] rounded-lg text-[#111318] placeholder:text-[#3C4046] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#111318] mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any notes about why this example works well..."
                  className="w-full h-20 p-3 border border-[#E6EAF0] rounded-lg text-[#111318] placeholder:text-[#3C4046] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#111318] hover:bg-[#2A2D35] disabled:bg-[#E6EAF0] disabled:text-[#3C4046] text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Example</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-[#E6EAF0] text-[#111318] font-semibold rounded-lg hover:bg-[#F8F9FC] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Examples List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              {/* UPDATED spinner color to purple */}
              <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#3C4046]">
                Loading training examples...
              </p>
            </div>
          </div>
        ) : examples.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E6EAF0] p-12 text-center">
            <div className="w-16 h-16 bg-[#F8F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-[#3C4046]" />
            </div>
            <h3 className="font-bold text-lg text-[#111318] mb-2">
              No Training Examples Yet
            </h3>
            <p className="text-sm text-[#3C4046]">
              Add examples of your previous successful content to help the AI
              learn your style
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {examples.map((example) => (
              <div
                key={example.id}
                className="bg-white rounded-xl border border-[#E6EAF0] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(example.example_type)}`}
                  >
                    {getTypeLabel(example.example_type)}
                  </span>
                  <button
                    onClick={() => handleDelete(example.id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {example.title && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#3C4046] mb-1">
                        Title
                      </h4>
                      <p className="text-sm text-[#111318]">{example.title}</p>
                    </div>
                  )}

                  {example.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#3C4046] mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-[#111318] whitespace-pre-wrap">
                        {example.description}
                      </p>
                    </div>
                  )}

                  {example.tags && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#3C4046] mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {example.tags.split(",").map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#F8F9FC] text-[#111318] text-xs rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {example.notes && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#3C4046] mb-1">
                        Notes
                      </h4>
                      <p className="text-sm text-[#3C4046] italic">
                        {example.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
