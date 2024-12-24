import { SVGAttributes } from "react";

export const OfflineIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M2 14.5c0 1.6.9 3.1 2.2 3.9l-.9.9c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3l14-14c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-1.8 1.8c-.6-.1-1.2-.1-1.7-.1-.1-.2-.3-.3-.4-.4-1-1-2.4-1.6-3.9-1.6s-2.9.6-3.9 1.6S4 9 4 10.5v.3c-.2.2-.5.3-.7.6-.8.8-1.3 1.9-1.3 3.1zm2.7-1.8c.2-.2.5-.4.7-.5.4-.2.7-.6.6-1.1v-.6c0-.9.4-1.8 1-2.5 1.3-1.3 3.6-1.3 4.9 0 .2.2.4.4.5.7.2.3.6.5 1 .4l-7.7 7.7c-1-.3-1.7-1.3-1.7-2.4 0-.6.3-1.2.7-1.7zM19.6 10.6 19 9.4c-.3-.5-.9-.6-1.4-.3-.5.3-.6.9-.3 1.4.2.3.4.7.5 1 .1.3.3.5.6.7.9.4 1.5 1.3 1.5 2.3 0 .7-.3 1.3-.7 1.8-.5.5-1.1.7-1.8.7H10c-.6 0-1 .4-1 1s.4 1 1 1h7.5c1.2 0 2.3-.5 3.2-1.3.9-.8 1.3-2 1.3-3.2 0-1.7-.9-3.2-2.4-3.9z" />
    </svg>
  );
};