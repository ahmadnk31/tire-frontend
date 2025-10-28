import React from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';

const BlogPostEmbed: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['blog-post-embed', slug],
    queryFn: () => blogApi.getBySlug(slug!),
    enabled: !!slug,
  });
  const post = postData?.post;

  if (isLoading) return <div style={{padding: 24}}>Loading...</div>;
  if (error || !post) return <div style={{padding: 24}}>Blog post not found.</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#fff', color: '#222', maxWidth: 700, margin: '0 auto', padding: 24 }}>
      {post.image && (
        <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
      )}
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{post.title}</h1>
      <div style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
        By {post.author} | {new Date(post.publishedAt).toLocaleDateString()}
      </div>
      <div style={{ fontSize: 18, marginBottom: 16 }}>{post.excerpt}</div>
      <div style={{ fontSize: 16 }}>
        <RichTextEditor value={post.content} onChange={() => {}} readOnly className="border-none shadow-none" />
      </div>
    </div>
  );
};

export default BlogPostEmbed;
