import { CategoryItem } from "./category";

export interface CodeSnippetItem {
  _id: string;
  title: string;
  category: CategoryItem;
  collected: 0 | 1;
  disabled: boolean;
  liked: 0 | 1;
  viewed: 0 | 1;
  relations: CodeSnippetItem[];
  next: string;
  prev: string;
  createdAt: string;
  updatedAt: string;
}
