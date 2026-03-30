export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/analyses/:path*',
    '/new/:path*',
    '/api/analyses/:path*',
    '/api/analyze/:path*',
    '/api/generate-doc/:path*',
  ],
};
