/**
 * Animated Icons from animate-ui
 * 
 * Usage:
 * import { ArrowRight, Bell, Check, ... } from "@/components/animate-ui/icons";
 * 
 * <ArrowRight animation="default" />
 * <Bell animation="ring" />
 * <Check animation="default" />
 */

// Base icon utilities
export {
  IconWrapper,
  useAnimateIconContext,
  getVariants,
  type IconProps,
} from "./icon";

// Individual animated icons
export { ArrowRight, ArrowRightIcon, type ArrowRightProps } from "./arrow-right";
export { Bell, BellIcon, type BellProps } from "./bell";
export { Check, CheckIcon, type CheckProps } from "./check";
export { Copy, CopyIcon, type CopyProps } from "./copy";
export { Heart, HeartIcon, type HeartProps } from "./heart";
export { Loader, LoaderIcon, type LoaderProps } from "./loader";
export { Menu, MenuIcon, type MenuProps } from "./menu";
export { Plus, PlusIcon, type PlusProps } from "./plus";
export { Search, SearchIcon, type SearchProps } from "./search";
export { Settings, SettingsIcon, type SettingsProps } from "./settings";
export { Sparkles, SparklesIcon, type SparklesProps } from "./sparkles";
export { Star, StarIcon, type StarProps } from "./star";
export { Trash, TrashIcon, type TrashProps } from "./trash";
export { User, UserIcon, type UserProps } from "./user";
export { X, XIcon, type XProps } from "./x";
