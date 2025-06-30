import { OrganizedKnowledgeView } from './client';

export default function KnowledgePage({ searchParams }) {
  // Convert searchParams to a plain object to avoid the Next.js bug
  const searchParamsObject = searchParams ? { ...searchParams } : {};
  
  return <OrganizedKnowledgeView searchParams={searchParamsObject} />;
}