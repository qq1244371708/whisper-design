import { Routes, Route } from 'react-router-dom';
import ChatRoomDemo from './views/ChatRoomDemo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatRoomDemo />} />
    </Routes>
  );
}

export default App;
