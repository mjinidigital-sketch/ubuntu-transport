import { CollectionCardsBlock } from './CollectionCardsBlock';

export interface CollectionCardsBlockWrapperProps {
  variant?: 'grid' | 'list' | 'masonry';
  title?: string;
  subtitle?: string;
  collectionSlug: string;
  limit?: number;
  columns?: 2 | 3 | 4;
  tagFilter?: string;
  showViewAll?: boolean;
  viewAllText?: string;
}

export function CollectionCardsBlockWrapper({
  variant = 'grid',
  title,
  subtitle,
  collectionSlug,
  limit = 6,
  columns = 3,
  tagFilter,
  showViewAll = true,
  viewAllText,
}: CollectionCardsBlockWrapperProps) {
  return (
    <CollectionCardsBlock
      title={title}
      subtitle={subtitle}
      collectionSlug={collectionSlug}
      limit={limit}
      columns={columns}
      tagFilter={tagFilter}
      showViewAll={showViewAll}
      viewAllText={viewAllText}
      variant={variant}
    />
  );
}
