// Fallback data for when network requests fail
export const fallbackBlogPosts = [
  {
    id: "fallback-1",
    title: "How to Create an Online Memorial for Someone You Love",
    excerpt: "A thoughtful step-by-step guide to creating a lasting online memorial, bringing together stories, photographs, audio notes, and tributes from family and friends.",
    content: "Creating an online memorial is an intimate, comforting way to honor a loved one's life. Rather than assembling a sterile obituary, Theirs allows families to preserve living memories, authentic stories, voice notes, and high-resolution photographs together in one collaborative space.",
    slug: "how-to-create-a-memorial-website",
    date: "2026-09-01T10:00:00Z",
    modified: "2026-09-01T10:00:00Z",
    author: {
      node: {
        name: "Theirs Editorial",
        avatar: {
          url: "/theirs-logo.svg"
        }
      }
    },
    featuredImage: null,
    categories: {
      nodes: [
        {
          name: "Guides",
          slug: "guides"
        }
      ]
    }
  }
];

// Offline detection utility
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true; // Assume online on server
}