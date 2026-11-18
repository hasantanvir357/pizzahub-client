import Banner from '@/components/home/Banner';
import Categories from '@/components/home/Categories';
import FeaturedMenu from '@/components/home/FeaturedMenu';
import HomeHighlights from '@/components/home/HomeHighlights';
import GuestReviews from '@/components/home/GuestReviews';

export default function HomePage() {
  return (
    <div>
      <Banner />
      <Categories />
      <FeaturedMenu />
      <HomeHighlights />
      <GuestReviews />
    </div>
  );
}
