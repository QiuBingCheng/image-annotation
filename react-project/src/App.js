import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Label from "./Label";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/label" element={<Label />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;