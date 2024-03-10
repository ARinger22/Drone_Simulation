import styled, { keyframes } from "styled-components";

export const slideInFromTop = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Heading = styled.span`
  background: linear-gradient(90deg, #2563eb, #48bb78, #6366f1);
  -webkit-background-clip: text;
  color: transparent;
`;
