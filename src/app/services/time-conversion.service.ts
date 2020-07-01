import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeConversionService {

  constructor() { }


  format_date(postDate: Date) {
    const stringDate = postDate.toDateString().split(' ');
    const date = stringDate[1] + ' ' + stringDate[2] + ', ' + stringDate[3];
    return date;
  }


  // format the time, date and time
  format_time(postDate: Date) {
    const currentDate = new Date();
    let hours = postDate.getHours();
    const amPm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // for 12 am

    const minutes = postDate.getMinutes() >= 10 ? postDate.getMinutes() :  '0' + postDate.getMinutes();

    const timeResult = hours + ':' + minutes + ' ' + amPm;

    if (this.isSameDay(postDate, currentDate)) {
      return 'Today at '  + timeResult;
    } else if (this.isYesterday(postDate, currentDate)) { // yesterday
      return 'Yesterday at ' + timeResult;
    } else if (currentDate.getFullYear() !== postDate.getFullYear()) { // check if it is not the same year
      return postDate.toDateString();
    }

    return postDate.toLocaleString('default', { month: 'long' }) + ' ' + postDate.getDate() + ' at ' + timeResult;
  }

  // if it is the same day
  isSameDay(postDate: Date, current: Date) {
    return (postDate.getDate() === current.getDate()) && (postDate.getMonth() === current.getMonth())
            && (postDate.getFullYear() === current.getFullYear());
  }

  // check the date are one day apart
  isYesterday(postDate: Date, current: Date) {
    const postDay = postDate.getDate();
    const postMonth = postDate.getMonth();
    const postYear = postDate.getFullYear();
    const currentDay = current.getDate();
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();

    // yesterday, same month, easy case
    if (postDay + 1 === currentDay && (postMonth === currentMonth)
        && ( postYear === currentYear)) {
      return true;
    }

    // yesterday but different month
    if (postMonth + 1 === currentMonth && currentYear === postYear && currentDay === 1) {

        // check if it is the last day of the month
        if (this.daysInMonths(postMonth, postYear) === postDay) {
          return true;
        }
    }

    // different year, this will only apply for new year
    return (postMonth === 11 && currentMonth === 0) && (postDay === 31 && currentDay === 1)
            && (postYear + 1 === currentYear);
  }

  // check number of day in a month
  daysInMonths(month: number, year: number) {
      return new Date(year, month + 1, 0).getDate();
  }
}
