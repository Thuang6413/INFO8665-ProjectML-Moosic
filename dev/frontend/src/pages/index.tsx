import CameraComponent from '../components/CameraComponent';
import Sidebar from '../components/Sidebar';

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <CameraComponent />
      </div>
    </div>
  );
}
