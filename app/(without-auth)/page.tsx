import HomePageBanner from "@/components/banner/HomePageBanner";
import HomePageCategoryList from "@/components/category/HomePageList";
import Sidebar from "@/components/sidebar/sidebar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="w-full flex">
            <Sidebar/>
            <HomePageCategoryList/>
        </div>
    </>
  );
}
