import { useState, useEffect } from "react";

interface JobDescriptionRendererProps {
  content: string;
  className?: string;
}

export default function JobDescriptionRenderer({
  content,
  className = "",
}: JobDescriptionRendererProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Debug logging (development only)
  if (process.env.NODE_ENV === "development") {
    console.log("JobDescriptionRenderer received content:", {
      length: content?.length,
      isHTML: content?.includes("<") || false,
    });
  }

  const defaultClasses = `
    text-neutral-700 text-base font-normal leading-relaxed
    [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-neutral-900 [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:pb-2 [&>h1]:border-b [&>h1]:border-neutral-200
    [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-neutral-900 [&>h2]:mb-4 [&>h2]:mt-6 [&>h2]:pb-2 [&>h2]:border-b [&>h2]:border-neutral-100
    [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-neutral-900 [&>h3]:mb-3 [&>h3]:mt-5
    [&>p]:mb-4 [&>p]:text-neutral-700 [&>p]:leading-relaxed [&>p]:text-justify
    [&>ul]:list-none [&>ul]:mb-6 [&>ul]:space-y-3 [&>ul]:pl-0
    [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-6 [&>ol]:space-y-3
    [&>li]:text-neutral-700 [&>li]:leading-relaxed [&>li]:relative [&>li]:pl-6
    [&>li:before]:content-['•'] [&>li:before]:absolute [&>li:before]:left-0 [&>li:before]:text-blue-600 [&>li:before]:font-bold [&>li:before]:text-lg
    [&>strong]:font-semibold [&>strong]:text-neutral-900 [&>strong]:bg-blue-50 [&>strong]:px-1 [&>strong]:py-0.5 [&>strong]:rounded
    [&>em]:italic [&>em]:text-blue-700 [&>em]:font-medium
    [&>a]:text-blue-600 [&>a]:underline [&>a]:cursor-pointer [&>a]:hover:text-blue-800 [&>a]:transition-colors
    [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:bg-gradient-to-r [&>blockquote]:from-blue-50 [&>blockquote]:to-indigo-50
    [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:font-medium
    [&>blockquote]:text-blue-900 [&>blockquote]:rounded-r-xl [&>blockquote]:shadow-sm
    [&>code]:bg-neutral-100 [&>code]:rounded-md [&>code]:px-2 [&>code]:border [&>code]:border-neutral-200
    [&>code]:py-1 [&>code]:font-mono [&>code]:text-sm [&>code]:text-neutral-800
  `
    .trim()
    .replace(/\s+/g, " ");

  // Function to convert plain text to HTML and ensure proper HTML rendering
  const processContentForDisplay = (text: string): string => {
    if (!text) return "<p>No job description provided.</p>";

    // Clean the text first
    const cleanText = text.trim();

    // Check if it's already properly formatted HTML
    const isHTML = cleanText.includes("<") && cleanText.includes(">");

    if (isHTML) {
      // Ensure the HTML is properly formatted and not escaped
      let processedHTML = cleanText;

      // Fix common HTML escaping issues
      processedHTML = processedHTML
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");

      // Validate that we have proper HTML structure
      if (
        processedHTML.includes("<h") ||
        processedHTML.includes("<p") ||
        processedHTML.includes("<ul") ||
        processedHTML.includes("<li")
      ) {
        return processedHTML;
      }
    }

    // Convert plain text to HTML with better paragraph handling
    return cleanText
      .split("\n\n") // Split by double newlines (paragraphs)
      .filter((paragraph) => paragraph.trim()) // Remove empty paragraphs
      .map((paragraph) => {
        // Handle single newlines within paragraphs
        const formatted = paragraph
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .join("<br/>");

        return `<p>${formatted}</p>`;
      })
      .join("");
  };

  const htmlContent = processContentForDisplay(content);

  // Show raw content for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("JobDescriptionRenderer - Content processing:", {
      originalContent: content?.substring(0, 100) + "...",
      isHTML: content?.includes("<"),
      processedHTML: htmlContent?.substring(0, 100) + "...",
      hasHTMLTags:
        htmlContent?.includes("<h") ||
        htmlContent?.includes("<p") ||
        htmlContent?.includes("<ul"),
    });
  }

  // Fallback component for when HTML rendering fails
  const FallbackRenderer = () => (
    <div className={`${defaultClasses} ${className}`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ Formatting issue detected. Displaying content in safe mode.
        </p>
      </div>
      <div className="whitespace-pre-line">
        {content || "No job description provided."}
      </div>
    </div>
  );

  // Check if we should use fallback rendering
  const shouldUseFallback =
    !htmlContent ||
    (content?.includes("<") &&
      htmlContent === content &&
      !htmlContent.includes("<h") &&
      !htmlContent.includes("<p"));

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className={`${defaultClasses} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (shouldUseFallback) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "JobDescriptionRenderer: Using fallback renderer due to HTML processing issue"
      );
    }
    return <FallbackRenderer />;
  }

  return (
    <div
      key={`job-desc-${content?.length}-${htmlContent?.length}`} // Force re-render when content changes
      className={`${defaultClasses} ${className}`}
      dangerouslySetInnerHTML={{
        __html: htmlContent,
      }}
    />
  );
}
