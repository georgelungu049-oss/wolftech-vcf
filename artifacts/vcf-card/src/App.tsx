import { Switch, Route, Router as WouterRouter } from "wouter";
import DigitalCard from "@/pages/DigitalCard";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DigitalCard} />
      <Route path="/admin" component={Admin} />
      <Route component={DigitalCard} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
