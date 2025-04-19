export async function getArticles(params: {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.tag) searchParams.set('tag', params.tag);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = new URL(`/api/articles`, baseUrl);
  url.search = searchParams.toString();

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
} 