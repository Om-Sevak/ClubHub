import './App.css';
import Header from './components/Header';
import ApiRequestBoxes from './components/ApiStatusTestBoxes';
import ClubCard from './components/ClubCard';
import EventCard from './components/EventCard';
import PostCard from './components/PostCard';

function App() {
  return (
    <div className="App">
      <Header />
      <ApiRequestBoxes />
      <ClubCard 
      name="Test Club Header" 
      desc="In the quiet dusk, shadows dance, whispering tales of forgotten dreams. Moonlight weaves through branches, a celestial ballet. Nature's lullaby cradles the world, where fleeting moments become timeless memories, etched in the tapestry of existence."
      img=" "
      followed={true}
      interests={['Sciencessssssss', 'Art', 'Environment', 'Coolness', 'Religion']}/>
      <EventCard
      event="my Event edited"
      eventId="65de9c718ddcbc4d4ecbd8e3"
      name="eyalTest"
      img=""
      isAdmin={false}
      dateString="2024-03-06T06:00:00.000Z"/>
      <PostCard
      clubname="Test Club Header"
      postname="Free Lunch Ideas"
      contents="Nestled amid city chaos, a serene park thrives. Mornings see joggers and blooming flowers; evenings reflect city lights on the pond. This enclave offers solace, a testament to nature's allure amidst the urban rush—a peaceful haven in the heart of the metropolis, inviting all to savor a moment of quiet amidst the bustling rhythm of city life. Beneath the lush canopy, the park weaves a tapestry of tranquility for those seeking respite. In the quiet dusk, shadows dance, whispering tales of forgotten dreams. Moonlight weaves through branches, a celestial ballet. Nature's lullaby cradles the world, where fleeting moments become timeless memories, etched in the tapestry of existence."
      />
    </div>
  );
}

export default App;
