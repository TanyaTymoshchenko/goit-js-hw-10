"use strict";
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast/dist/js/iziToast.min.js';
import 'izitoast/dist/css/iziToast.min.css';

const startButton = document.querySelector('[data-start]');
const datetimePicker = document.getElementById('datetime-picker');
const countdownElements = {
  days: document.querySelector('[data-days]'),
  hours: document.querySelector('[data-hours]'),
  minutes: document.querySelector('[data-minutes]'),
  seconds: document.querySelector('[data-seconds]'),
};

let userSelectedDate;

startButton.disabled = true;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    userSelectedDate = selectedDates[0];
    startButton.disabled = !isFutureDate(userSelectedDate);
  },
};

flatpickr('#datetime-picker', options);

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);
  return { days, hours, minutes, seconds };
}

function isFutureDate(date) {
  if (date < Date.now()) {
    iziToast.error({
      title: 'Error',
      message: 'Please choose a date in the future',
      position: 'topCenter',
    });
    return false;
  } else {
    return true;
  }
}

function addLeadingZero(value) {
  return value.toString().padStart(2, '0');
}

startButton.addEventListener('click', () => {
  if (!isFutureDate(userSelectedDate)) {
    return;
  }

  startButton.disabled = datetimePicker.disabled = true;
  let timeDifference = userSelectedDate - Date.now();
  const countdownInterval = setInterval(() => {
    const { days, hours, minutes, seconds } = convertMs(timeDifference);

    Object.entries(countdownElements).forEach(([key, element]) => {
      element.textContent = addLeadingZero({ days, hours, minutes, seconds }[key]);
    });

    if (timeDifference <= 0) {
      clearInterval(countdownInterval);
      Object.values(countdownElements).forEach(element => (element.textContent = '00'));
      datetimePicker.disabled = false;
      iziToast.success({
        title: 'Countdown Finished',
        message: 'The countdown has reached the end.',
        position: 'topCenter',
      });
    }

    timeDifference -= 1000;
  }, 1000);
});