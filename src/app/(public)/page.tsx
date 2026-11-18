import Banner from '@/components/home/Banner';
import Categories from '@/components/home/Categories';
import { SpecialOfferBanner, WhyChooseUs } from '@/components/home/HomeHighlights';
import FeaturedMenu from '@/components/home/FeaturedMenu';
import GuestReviews from '@/components/home/GuestReviews';

export default function HomePage() {
  return (
    <div>
      <Banner />
      <Categories />
      <SpecialOfferBanner />
      <FeaturedMenu />
      <WhyChooseUs />
      <GuestReviews />
    </div>
  );
}
