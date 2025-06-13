import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import slider_1 from "../Images/slider_1.jpg";
import slider_2 from "../Images/slider_2.jpg";
import slider_3 from "../Images/slider_3.jpg";
import slider_4 from "../Images/slider_4.jpg";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "../index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const images = [slider_1, slider_2, slider_3, slider_4];

export default function BannerSwiper() {
  return (
    <Swiper
      className="mySwiper"
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
    >
      {images.map((imgSrc, index) => (
        <SwiperSlide key={index} id="slid">
          <div className="swiperimage">
            <img src={imgSrc} alt={`slide ${index + 1}`} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
