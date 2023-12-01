import { useContext } from "react";
import PathContext from "../PathProvider";

const usePath = () => {
    return useContext(PathContext);
}

export default usePath;