import { createGlobalState } from "react-hooks-global-state";
import { subscribeToHttpEvent } from "./httpClient";
import decodeJWT from "./utils/decodeJWT";

const anonymous = { sub: "anonymous", role: {} };
let token = sessionStorage.getItem("prise_de_rdv:token");

const { useGlobalState, getGlobalState, setGlobalState } = createGlobalState({
  auth: token ? decodeJWT(token) : anonymous,
});

subscribeToHttpEvent("http:error", (response) => {
  if (response.status === 401) {
    //Auto logout user when token is invalid
    sessionStorage.removeItem("prise_de_rdv:token");
    setGlobalState("auth", anonymous);
  }
});

export const getAuth = () => getGlobalState("auth");
export const useAuthState = () => useGlobalState("auth");
export { anonymous };
