import HomePageBanner from "@/components/banner/HomePageBanner";
import HomePageCategoryList from "@/components/category/HomePageList";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <HomePageBanner/>
    <HomePageCategoryList/>
    <div className="h-screen"></div>
    </>
  );
}
