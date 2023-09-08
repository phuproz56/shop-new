import React, { useEffect, useState } from "react";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/styles";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { backend_url, server } from "../server";
import { RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import currency from "currency-formatter";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);

  const reviewHandler = async (e) => {
    await axios
      .put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success(res.data.message);
        dispatch(getAllOrdersOfUser(user._id));
        setComment("");
        setRating(null);
        setOpen(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };
  
  const refundHandler = async () => {
    await axios.put(`${server}/order/order-refund/${id}`,{
      status: "Processing refund"
    }).then((res) => {
       toast.success(res.data.message);
    dispatch(getAllOrdersOfUser(user._id));
    }).catch((error) => {
      toast.error(error.response.data.message);
    })
  };

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px]">Thông tin đơn hàng</h1>
        </div>
      </div>

      <div className="w-full flex items-center justify-between pt-6">
        <h5 className="text-[#00000084]">
         ID đơn hàng: <span>#{data?._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-[#00000084]">
         Thời gian: <span>{data?.createdAt?.slice(0, 10)}</span>
        </h5>
      </div>

      {/* order items */}
      <br />
      <br />
      {data &&
        data?.cart.map((item, index) => {
          return(
          <div className="w-full flex items-start mb-5">
            <img
              src={`${backend_url}/${item.images[0]}`}
              alt=""
              className="w-[80x] h-[80px]"
            />
            <div className="w-full">
              <h5 className="pl-3 text-[20px]">{item.name}</h5>
              <h5 className="pl-3 text-[20px] text-[#00000091]">
              {currency.format(item.discountPrice, { code: "VND" })} x {item.qty}
              </h5>
            </div>
            {!item.isReviewed && data?.status === "Delivered" ?  <div
                className={`${styles.button} text-[#fff]`}
                onClick={() => setOpen(true) || setSelectedItem(item)}
              >
               Đánh giá SP
              </div> : (
             null
            )}
          </div>
          )
         })}

      {/* review popup */}
      {open && (
        <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
          <div className="w-[50%] h-min bg-[#fff] shadow rounded-md p-3">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <h2 className="text-[30px] font-[500] font-Poppins text-center">
              Đánh giá sản phẩm
            </h2>
            <br />
            <div className="w-full flex ">
              <img
                src={`${backend_url}/${selectedItem?.images[0]}`}
                alt=""
                className="w-[90px] h-[90px] border-4 border-sky-500 rounded-[8px]"
              />
              <div>
                <div className="pl-3 text-[20px]">{selectedItem?.name}</div>
                <h4 className="pl-3 text-[20px]">
                 {currency.format(selectedItem?.discountPrice, { code: "VND" })} x {selectedItem?.qty}
                </h4>
              </div>
            </div>

            <br />
            <br />

            {/* ratings */}
            <h5 className="pl-3 text-[20px] font-[500]">
              Đánh giá : <span className="text-red-500">*</span>
            </h5>
            <div className="flex w-full ml-2 pt-1">
              {[1, 2, 3, 4, 5].map((i) =>
                rating >= i ? (
                  <AiFillStar
                    key={i}
                    className="mr-1 cursor-pointer"
                    color="rgb(246,186,0)"
                    size={25}
                    onClick={() => setRating(i)}
                  />
                ) : (
                  <AiOutlineStar
                    key={i}
                    className="mr-1 cursor-pointer"
                    color="rgb(246,186,0)"
                    size={25}
                    onClick={() => setRating(i)}
                  />
                )
              )}
            </div>
            <br />
            <div className="w-full ml-3">
              <label className="block text-[20px] font-[500]">
                Viết đánh giá
                <span className="ml-1 font-[400] text-[16px] text-[#00000052]">
                  (không bắt buộc)
                </span>
              </label>
              <textarea
                name="comment"
                id=""
                cols="20"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy để lại bình luận, nhận xét của bạn về sản phẩm nhé, điều này cực kì hữu ích cho những người mua khác và cả chính cửa hàng đó!"
                className="mt-2 w-[95%] border p-2 outline-none"
              ></textarea>
            </div>
            <div
              className={`${styles.button} text-white text-[20px] ml-3`}
              onClick={rating > 1 ? reviewHandler : null}
            >
              Gửi
            </div>
          </div>
        </div>
      )}

      <div className="border-t w-full text-right">
        <h5 className="pt-3 text-[18px]">
          Tổng tiền: <strong> {currency.format(data?.totalPrice, { code: "VND" })}</strong>
        </h5>
      </div>
      <br />
      <br />
      <div className="w-full 800px:flex items-center">
        <div className="w-full 800px:w-[60%]">
          <h4 className="pt-3 text-[20px] font-[700]">Thông tin giao hàng:</h4>
          <h4 className="pt-3 text-[20px]">
           <b>Địa chỉ:</b> {data?.shippingAddress.address1 +
              ", " +
              data?.shippingAddress.city}
          </h4>
          {/* <h4 className=" text-[20px]">{data?.shippingAddress.country}</h4> */}
          {/* <h4 className=" text-[20px]">{data?.shippingAddress.city}</h4> */}
          <h4 className=" text-[20px]"><b>Số điện thoại:</b> (+84) {data?.user?.phoneNumber}</h4>
        </div>
        <div className="w-full 800px:w-[40%]">
          <h4 className="pt-3 text-[20px]">Thông tin thanh toán:</h4>
          <h4>
            Trạng thái:{" "}
            {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
          </h4>
          <br />
           {
            data?.status === "Delivered" && (
              <div className={`${styles.button} text-white`}
              onClick={refundHandler}
              >Yêu cầu trả hàng</div>
            )
           }
        </div>
      </div>
      <br />
      <Link to="/">
        <div className={`${styles.button} text-white`}>Gửi tin nhắn</div>
      </Link>
      <br />
      <br />
    </div>
  );
};

export default UserOrderDetails;
