import { userAuthentication } from "../config/userAuthentication";
import HomeStack from "./HomeStack";
import WelcomeStack from "./WelcomeStack";

const RootNavigation = () => {
    const { user } = userAuthentication();

    return user ? <HomeStack /> : <WelcomeStack />
}

export default RootNavigation;