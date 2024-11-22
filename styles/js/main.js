// main help fcs
const removeClassFromElements = (elements, className) => {
  elements.forEach((el) => {
    el.classList.remove(className);
  });
};

const addClassToElements = (elements, className) => {
  elements.forEach((el) => {
    el.classList.add(className);
  });
};

const addClassToBody = (className) => {
  const body = document.querySelector("body");
  body.classList.add(className);
};

const removeClassFromBody = (className) => {
  const body = document.querySelector("body");
  body.classList.remove(className);
};

// preloader function
const preloader = (selector, timeout, withLock) => {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll(selector);

    if (elements.length > 0) {
      if (withLock) {
        addClassToBody("lock");

        setTimeout(() => {
          addClassToElements(elements, "no-display");
          removeClassFromBody("lock");
          resolve();
        }, timeout);
      } else {
        setTimeout(() => {
          removeClassFromElements(elements, selector.replace(".", ""));
          resolve();
        }, timeout);
      }
    } else {
      resolve();
    }
  });
};

// start preloader
preloader(".page-preloader", 1000, true);

// navigation
const scrollButtons = document.querySelectorAll(".main-btn[data-path]");

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const path = button.dataset.path;

    const targetElement = document.querySelector(`[data-target="${path}"]`);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// slider reuse fcs
const initSliderElements = (slider, wrapperSelector, slideSelector) => {
  const slidesWrapper = slider.querySelector(wrapperSelector);
  const slides = slider.querySelectorAll(slideSelector);
  const prevBtn = slider.querySelector(".slider-btn--prev");
  const nextBtn = slider.querySelector(".slider-btn--next");

  return {
    slidesWrapper,
    slides,
    prevBtn,
    nextBtn,
  };
};

const getSliderTotalSteps = (wrapper, slides) => {
  const shareSliderLength = Math.floor(
    wrapper.offsetWidth / slides[0].offsetWidth
  );

  return slides.length - shareSliderLength;
};

const getObserverMargins = (wrapper, slides) => {
  const currentRatio = Math.round(
    ((wrapper.offsetWidth - slides[0].offsetWidth) / wrapper.offsetWidth) * 100
  );

  if (currentRatio === 0) {
    return "0px 0px 0px 0px";
  } else {
    return `0px ${-currentRatio}% 0px 0px`;
  }
};

// steps slider settings
const stepsSlider = document.querySelector(".steps-slider");

if (stepsSlider) {
  const { slidesWrapper, slides, prevBtn, nextBtn } = initSliderElements(
    stepsSlider,
    ".steps-slider__wrapper",
    ".steps-slider__slide"
  );

  const counter = stepsSlider.querySelector(".steps-slider__count .bullets");

  slides.forEach((slide, index) => {
    slide.setAttribute("data-index", index);
  });

  let bullets = [];
  let currentSlide = 0;

  const initCounter = () => {
    const numBullets = getSliderTotalSteps(slidesWrapper, slides) + 1;

    if (bullets.length !== numBullets) {
      counter.innerHTML = "";
      bullets = [];
      for (let i = 0; i < numBullets; i++) {
        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        counter.append(bullet);
        bullets.push(bullet);
      }
    }

    changeActiveBullet(currentSlide);
  };

  const changeBtnStatus = (currentSlide, prevBtn, nextBtn) => {
    const lastIndex = getSliderTotalSteps(slidesWrapper, slides);
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === lastIndex;
  };

  const changeActiveBullet = (index) => {
    if (bullets.length > 0 && bullets[index]) {
      removeClassFromElements(bullets, "bullet--active");
      bullets[index].classList.add("bullet--active");
    }
  };

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentSlide = parseInt(entry.target.getAttribute("data-index"));
        changeActiveBullet(currentSlide);
        changeBtnStatus(currentSlide, prevBtn, nextBtn);
      }
    });
  };

  const initSliderObserver = () => {
    const options = {
      root: stepsSlider,
      rootMargin: getObserverMargins(slidesWrapper, slides),
      threshold: 0.8,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    slides.forEach((slide) => observer.observe(slide));

    initCounter();
  };

  const scrollSlider = () => {
    const targetSlide = slides[currentSlide];
    const scrollPosition = targetSlide.offsetLeft;

    slidesWrapper.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    changeBtnStatus(currentSlide, prevBtn, nextBtn);
  };

  const rebutStepSlider = () => {
    initSliderObserver();
    changeBtnStatus(currentSlide, prevBtn, nextBtn);
    scrollSlider();
  };

  nextBtn.addEventListener("click", () => {
    currentSlide++;
    scrollSlider();
  });

  prevBtn.addEventListener("click", () => {
    currentSlide--;
    scrollSlider();
  });

  window.addEventListener("resize", () => {
    rebutStepSlider();
  });

  window.addEventListener("orientationchange", () => {
    rebutStepSlider();
  });

  document.addEventListener("DOMContentLoaded", () => {
    rebutStepSlider();
  });
}

// participants slider
const participantsSlider = document.querySelector(".participants-slider");

if (participantsSlider) {
  const { slidesWrapper, slides, prevBtn, nextBtn } = initSliderElements(
    participantsSlider,
    ".participants-slider__slides",
    ".participants-slider__slide"
  );
  const counter = participantsSlider.querySelector(
    ".participants-slider__count"
  );

  let currentSlide = 0;
  let sliderStepsLength = getSliderTotalSteps(slidesWrapper, slides);
  let sliderInterval;
  let autoPlayInterval = 4000;

  slides.forEach((slide, index) => {
    slide.setAttribute("data-index", index);
  });

  const updateCounter = () => {
    counter.innerHTML = `${currentSlide + 1} / ${slides.length}`;
  };

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentSlide = parseInt(entry.target.getAttribute("data-index"));
        updateCounter();
      }
    });
  };

  const initSliderObserver = () => {
    const options = {
      root: slidesWrapper,
      rootMargin: getObserverMargins(slidesWrapper, slides),
      threshold: 0.8,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    slides.forEach((slide) => observer.observe(slide));

    updateCounter();
  };

  const scrollSlider = (direction) => {
    let scrollTarget;
    let scrollSpeed = "smooth";

    if (direction === "next") {
      scrollTarget = currentSlide + 1;
    } else {
      scrollTarget = currentSlide - 1;
    }

    if (scrollTarget < 0) {
      scrollTarget = sliderStepsLength;
      scrollSpeed = "auto";
    }

    if (scrollTarget > sliderStepsLength) {
      scrollTarget = 0;
      scrollSpeed = "auto";
    }

    const targetSlide = slides[scrollTarget];
    const scrollPosition = targetSlide.offsetLeft;

    slidesWrapper.scrollTo({
      left: scrollPosition,
      behavior: scrollSpeed,
    });
  };

  prevBtn.addEventListener("click", () => {
    scrollSlider("prev");
  });
  nextBtn.addEventListener("click", () => {
    scrollSlider("next");
  });

  const startAutoPlay = () => {
    sliderInterval = setInterval(() => {
      scrollSlider("next");
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    clearInterval(sliderInterval);
  };

  participantsSlider.addEventListener("mouseenter", stopAutoPlay);
  participantsSlider.addEventListener("mouseleave", startAutoPlay);

  const rebutParticipantSlider = () => {
    sliderStepsLength = getSliderTotalSteps(slidesWrapper, slides);

    if (currentSlide > sliderStepsLength) {
      currentSlide = sliderStepsLength;
    }

    initSliderObserver();
    updateCounter();
  };

  window.addEventListener("resize", () => {
    rebutParticipantSlider();
  });

  window.addEventListener("orientationchange", () => {
    rebutParticipantSlider();
  });

  document.addEventListener("DOMContentLoaded", () => {
    rebutParticipantSlider();
    startAutoPlay();
  });
}
