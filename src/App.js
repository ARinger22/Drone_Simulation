import styled, { keyframes } from "styled-components";

import Coordinate from "./components/Coordinate";

const Heading = styled.span`
  background: linear-gradient(90deg, #2563eb, #48bb78, #6366f1);
  -webkit-background-clip: text;
  color: transparent;
`;

function App() {
  return (
    <div>
      <h1 className="flex text-black font-bold text-4xl items-center justify-center h-20 bg-slate-600">
        <Heading>Drone-simulator</Heading>
      </h1>
      <Coordinate />
    </div>
  );
}

export default App;
