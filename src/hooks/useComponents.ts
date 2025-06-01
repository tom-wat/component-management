// src/hooks/useComponents.ts - クラウド専用版
import { useCloudComponents } from './useCloudComponents';

/**
 * メインのコンポーネント管理フック
 * クラウド専用版 - APIが唯一のデータソース
 */
export const useComponents = () => {
  return useCloudComponents();
};

// 後方互換性のため、useLocalComponentsを残す（使用されていない場合は削除予定）
export { useCloudComponents as useLocalComponents };