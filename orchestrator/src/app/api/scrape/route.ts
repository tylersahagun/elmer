import { NextRequest, NextResponse } from "next/server";

// Simple URL content extraction
// In production, this would use a proper scraping service like Firecrawl, Browserless, or Puppeteer
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the page content
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ElmerBot/1.0; +https://elmer.pm)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // Extract Open Graph data
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    // Extract main text content (simplified - strips HTML tags)
    // Remove script and style elements first
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");

    // Try to extract article or main content
    const articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    
    const contentHtml = articleMatch ? articleMatch[1] : cleanHtml;

    // Strip remaining HTML tags and clean up whitespace
    const textContent = contentHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate to reasonable length (first 10000 chars)
    const truncatedContent = textContent.length > 10000 
      ? textContent.substring(0, 10000) + "..."
      : textContent;

    return NextResponse.json({
      url: parsedUrl.toString(),
      title: ogTitleMatch ? ogTitleMatch[1].trim() : title,
      description: ogDescMatch ? ogDescMatch[1].trim() : description,
      image: ogImageMatch ? ogImageMatch[1].trim() : null,
      content: truncatedContent,
      contentType,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
