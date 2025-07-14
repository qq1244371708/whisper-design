import { Routes, Route } from 'react-router-dom';
import ChatRoomDemo from './views/ChatRoomDemo';
import ChatRoomDemoWithAPI from './views/ChatRoomDemoWithAPI';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatRoomDemo />} />
      <Route path="/api" element={<ChatRoomDemoWithAPI />} />
    </Routes>
  );
}

export default App;
