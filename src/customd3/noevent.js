import {event} from "d3";

export function nopropagation() {
  event.stopImmediatePropagation();
}

export default function() {
  event.preventDefault();
  event.stopImmediatePropagation();
}
