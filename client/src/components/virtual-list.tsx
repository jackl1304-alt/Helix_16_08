import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

// Optimized List Item Component
const ListItem = React.memo(({ index, style, data }: any) => {
  const { items, renderItem } = data;
  const item = items[index];
  
  return (
    <div style={style} className="will-change-transform">
      {renderItem(item, index)}
    </div>
  );
}, areEqual);

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  getItemKey
}: VirtualListProps<T>) {
  const itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  const itemKey = useCallback((index: number) => {
    if (getItemKey) {
      return getItemKey(items[index], index);
    }
    return index;
  }, [items, getItemKey]);

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={itemData}
      itemKey={itemKey}
      overscanCount={5}
      className="scrollbar-thin"
    >
      {ListItem}
    </List>
  );
}

// High-performance scrollable container for large datasets
interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore = false,
  loading = false,
  itemHeight = 100,
  containerHeight = 600
}: InfiniteScrollProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Calculate visible range
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(items.length, start + Math.ceil(clientHeight / itemHeight) + 5);
    
    setVisibleRange({ start, end });
    
    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && loadMore && !loading) {
      loadMore();
    }
  }, [itemHeight, items.length, hasMore, loadMore, loading]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return (
    <div
      className="overflow-auto scrollbar-thin"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: visibleRange.start * itemHeight }} />
      
      {/* Visible items */}
      {visibleItems.map((item, index) => (
        <div
          key={visibleRange.start + index}
          className="will-change-transform"
          style={{ height: itemHeight }}
        >
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
      
      {/* Spacer for items after visible range */}
      <div style={{ height: (items.length - visibleRange.end) * itemHeight }} />
      
      {/* Loading indicator */}
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}