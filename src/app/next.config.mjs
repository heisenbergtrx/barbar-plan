/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eğer proje 'src' klasörü içindeyse Next.js bunu otomatik algılar ama 
  // bazen garantiye almak gerekir.
  reactStrictMode: false, 
  eslint: {
    // Build sırasında lint hatalarını görmezden gel (Deploy'u engellemesin)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;