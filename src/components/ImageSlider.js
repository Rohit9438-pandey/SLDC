import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from 'swiper/modules';
// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay"; 
import 'swiper/css/navigation';

import "../index.css";
import 'bootstrap/dist/css/bootstrap.min.css';


const images = [
    "/images/slider_1.jpg",
    "/images/slider_2.jpg",
    "/images/slider_3.jpg",
    "/images/slider_4.jpg"
];

export default function BannerSwiper() {
  return (
      <Swiper
          className="mySwiper"
          modules={[Autoplay]} // Add Autoplay module here
          autoplay={{
              delay: 3000, // Delay between transitions (in milliseconds)
              disableOnInteraction: false, // Continue autoplay after user interactions
          }}
      
         
      >
        {
            images.map((ele, i) => {
                return (
                    <SwiperSlide key={i} id="slid">
                        <div className="swiperimage">
                           <img src={ele} alt={`image ${i + 1}`} />
                        </div>
                    </SwiperSlide>
                );
            })
        }
      </Swiper>
  );
}
