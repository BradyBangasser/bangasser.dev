import { Feed } from "feed";
import { getAllPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export async function GET() {
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.seo.defaultDescription,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    favicon: `${siteConfig.url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
    author: { name: siteConfig.name, email: siteConfig.email, link: siteConfig.url },
  });

  for (const post of getAllPosts()) {
    feed.addItem({
      title: post.title,
      id: `${siteConfig.url}/blog/${post.slug}`,
      link: `${siteConfig.url}/blog/${post.slug}`,
      description: post.summary,
      date: new Date(post.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
