import { Link } from "react-router-dom";

function NotFound (){
    return(
        <div>
            <h1>此路由不存在</h1>
            <Link to="/Front">回到首頁</Link>
        </div>
    )
}
export default NotFound;