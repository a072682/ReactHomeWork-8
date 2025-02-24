import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Modal } from "bootstrap";
import ReactLoading from 'react-loading';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  
  const [tempProduct, setTempProduct] = useState([]);

  const [cart,setCart] = useState({});

  const [isLoading,setIsLoading] = useState(false);

  const [isScreenLoading,setIsScreenLoading] = useState(false);
  
  


  const getCart = async()=>{
    try{
      const getCartRef = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`);
      console.log("取得購物車成功",getCartRef.data);
      setCart(getCartRef.data.data);
      console.log("測試",getCartRef.data.data);
    }
    catch(error){
      console.log("取得購物車失敗",error.data);
    }
  } 

  useEffect(() => {
    const getProduct = async () => {
    //   setIsScreenLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/product/${product_id}`);
        console.log("取得產品成功",res.data.product);
        setProduct(res.data.product);
      } catch (error) {
        alert("取得產品失敗");
        console.log("取得產品失敗",error.data);
      }finally{
        // setIsScreenLoading(false);
      }
    };
    getProduct();
    // getCart();
  }, []);

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };

  const [qtySelect, setQtySelect] = useState(1);

  
  
  const removeCartItem = async(cartItem_id)=>{
    setIsScreenLoading(true);
    try{
      const removeCartItemRef = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`);
      console.log("刪除產品成功",removeCartItemRef.data);
      getCart();
    }catch(error){
      console.log("刪除產品失敗",error.data)
    }finally{
      setIsScreenLoading(false);
    }
  }

  const removeCart = async()=>{
    setIsScreenLoading(true);
    try{
      const removeCartRef = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/carts`);
      console.log("清空購物車成功",removeCartRef.data);
      getCart();
    }catch(error){
      console.log("清空購物車失敗",error.data)
    }finally{
      setIsScreenLoading(false);
    }
  }

  const updateCartItem = async(cartItem_id,product_id,qty)=>{
    setIsScreenLoading(true);
    try{
      const updateCartItemRef = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`,{
        data:{
          product_id,
          qty:Number(qty)
        }
      });
      console.log("更新產品資訊成功",updateCartItemRef.data);
      getCart();
    }catch(error){
      console.log("更新產品資訊失敗",error.data)
    }finally{
      setIsScreenLoading(false);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  
  const onSubmit = handleSubmit((data)=>{
    console.log(data);
    const { message, ...user} = data;
    const userInfo = {
      data:{
        user,
        message
      }
    }
    checkOut(userInfo);
  })

  const checkOut = async(data)=>{
    setIsScreenLoading(true);
    try{
      const checkOutRef = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`,data);
      reset();
      console.log("結帳成功",checkOutRef.data);
    }catch(error){
      console.log("結帳失敗",error.data);
    }finally{
      setIsScreenLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="mt-4">
        

        <div
          ref={productModalRef}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="modal fade"
          id="productModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  產品名稱：{tempProduct.title}
                </h2>
                <button
                  onClick={closeModal}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={tempProduct.imageUrl}
                  alt={tempProduct.title}
                  className="img-fluid"
                />
                <p>內容：{tempProduct.content}</p>
                <p>描述：{tempProduct.description}</p>
                <p>
                  價錢：{tempProduct.price}{" "}
                  <del>{tempProduct.origin_price}</del> 元
                </p>
                <div className="input-group align-items-center">
                  <label htmlFor="qtySelect">數量：</label>
                  <select
                    value={qtySelect}
                    onChange={(e) => setQtySelect(e.target.value)}
                    id="qtySelect"
                    className="form-select"
                  >
                    {Array.from({ length: 10 }).map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button disabled={isLoading} onClick={()=>{addCartItem(tempProduct.id,qtySelect)}} type="button" className="btn btn-primary d-flex align-items-center gap-2">
                  <div>加入購物車</div>
                  {
                    isLoading && (<ReactLoading type={"spin"} color={"#000"} height={"1.5rem"} width={"1.5rem"}/>)
                  }
                  
                </button>
              </div>
            </div>
          </div>
        </div>
        {
          cart.carts?.length > 0 && 
          (
            <div>
              <div className="text-end py-3">
                <button onClick={removeCart} className="btn btn-outline-danger" type="button">
                  清空購物車
                </button>
              </div>

              <table className="table align-middle">
                <thead>
                  <tr>
                    <th></th>
                    <th>品名</th>
                    <th style={{ width: "150px" }}>數量/單位</th>
                    <th className="text-end">單價</th>
                  </tr>
                </thead>

                <tbody>
                  { cart.carts?.map((cartItem) => (
                      <tr key={cartItem.id}>
                        <td>
                          <button onClick={()=>{removeCartItem(cartItem.id)}} type="button" className="btn btn-outline-danger btn-sm">
                            x
                          </button>
                        </td>
                        <td>{cartItem.product.title}</td>
                        <td style={{ width: "150px" }}>
                          <div className="d-flex align-items-center">
                            <div className="btn-group me-2" role="group">
                              <button
                                onClick={()=>{updateCartItem(cartItem.id,cartItem.product.id,cartItem.qty - 1)}}
                                disabled={cartItem.qty === 1}
                                type="button"
                                className="btn btn-outline-dark btn-sm"
                              >
                                -
                              </button>
                              <span
                                className="btn border border-dark"
                                style={{ width: "50px", cursor: "auto" }}
                              >{cartItem.qty}</span>
                              <button
                                onClick={()=>{updateCartItem(cartItem.id,cartItem.product.id,cartItem.qty + 1)}}
                                type="button"
                                className="btn btn-outline-dark btn-sm"
                              >
                                +
                              </button>
                            </div>
                            <span className="input-group-text bg-transparent border-0">
                              {cartItem.product.unit}
                            </span>
                          </div>
                        </td>
                        <td className="text-end">{cartItem.product.price}</td>
                      </tr>
                    ))
                  }
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">
                      總計：
                    </td>
                    <td className="text-end" style={{ width: "130px" }}>{cart.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        }
      </div>

      <div className="my-5 row justify-content-center">
        <form onSubmit={onSubmit} className="col-md-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              {
                ...register("email",{
                  required:"Email欄位必填",
                  pattern:{
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:"Email格式錯誤"
                  }
                })
              }
              id="email"
              type="email"
              className={`form-control ${errors.email && "is-invalid"}`}
              placeholder="請輸入 Email"
            />

            {errors.email && <p className="text-danger my-2">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              {...register("name",{
                required:"姓名欄位必填"
              })}
              id="name"
              className={`form-control ${errors.name && "is-invalid"}`}
              placeholder="請輸入姓名"
            />

            {errors.name && <p className="text-danger my-2">{errors.name.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              {...register("tel",{
                required:"電話欄位必填",
                pattern:{
                  value: /^(0[2-8]\d{7}|09\d{8})$/,
                  message:"電話格式錯誤"
                }
              })}
              id="tel"
              type="text"
              className={`form-control ${errors.tel && "is-invalid"}`}
              placeholder="請輸入電話"
            />

            {errors.tel && <p className="text-danger my-2">{errors.tel.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              {...register("address",{
                required:"地址欄位必填"
              })}
              id="address"
              type="text"
              className={`form-control ${errors.address && "is-invalid"}`}
              placeholder="請輸入地址"
            />
            {errors.address && <p className="text-danger my-2">{errors.address.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              {
                ...register("message")
              }
              id="message"
              className="form-control"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>
      

      
      

    </div>
  );
}

export default App;
