import Slider from "react-slick";
import PostCard from "./PostCard";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown} from "@fortawesome/free-solid-svg-icons"
import postApi from "../api/posts"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NotFound from '../components/NotFound';

import './PostCarousel.css'

const NUM_CARDS = 24;

const getNumberPostsPerRow = (width) => {
    if(width>1850) {
        return 4;
    }
    else if(width>1350) {
        return 3;
    }
    else {
        return 2;
    }
}

const PostCarousel = () => {

  const [postsRows, setPostsRows] = useState([]);
  const [numPostsPerRow, setnumPostsPerRow] = useState(getNumberPostsPerRow(window.innerWidth));

  useEffect(() => {
  const getPosts = async () => {
      const { status: reqStatus, data: postsData } = await postApi.getPostsBrowse({ limit: NUM_CARDS, includeJoined:true });
      if (reqStatus === 200) {
        
        const rowFormat = {};
        
        for(let numPerRow = 2; numPerRow < 5; numPerRow++) {
            const allRowData = postsData.posts.reduce(function (rows, key, index) { 
                return (index % numPerRow == 0 ? rows.push([key]) 
                  : rows[rows.length-1].push(key)) && rows;
              }, []);
            
            const jsxRow = allRowData.map((rowData, keyAlpha) =>  {
                return (
                  <div key={keyAlpha} >
                  <div className="post-double-container">
                    {
                        rowData.map((data, keyBeta) => {
                            return (
                                <div className="post-carousel-card" key={keyBeta}>
                                <PostCard
                                    postname={data.title}
                                    postId={data._id}
                                    clubname={data.clubName}
                                    contents={data.content}
                                    img={data.clubIconImgUrl}
                                    isPoster={data.imgUrl}
                                    dateString={data.date}
                                    />
                                </div>
                            );
                        })
                    }
                    </div>
                  </div>
            );})

            rowFormat[numPerRow] = jsxRow;
        }
        setPostsRows(rowFormat);
      }
      else {
        return <NotFound />;
      }  
  };

  const handleResize = () => {
    setnumPostsPerRow(getNumberPostsPerRow(window.innerWidth)); // Adjust the threshold as needed
  };

  window.addEventListener('resize', handleResize);
  getPosts();

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
  
  
  
  const slider = useRef(null);
  var settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows:false,
    vertical:true,
  };
  return (
    <div className="post-carousel-row">
      <div className="post-carousel-container">
        <Slider ref={slider} {...settings}>
          {postsRows[numPostsPerRow]}
        </Slider>
      </div>
      <div className="post-carousel-icon">
      <button className="post-carousel-nav-button" 
      onClick={() => slider?.current?.slickNext()}>
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      </div>
    </div>
  );
}

export default PostCarousel;