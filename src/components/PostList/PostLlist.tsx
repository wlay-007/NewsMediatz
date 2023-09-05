import React, { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../hook";
import Style from "./PostList.module.scss";
import { Card, Tag, Statistic, Spin } from "antd";
import { fetchPosts } from "../../store/postSlise";
import { motion, useAnimation } from "framer-motion";
import { debounce } from "lodash";

const PostList: React.FC = () => {
  const [reachedEnd, setReachedEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.posts);
  const posts = useAppSelector((state) => state.posts.list);
  const controls = useAnimation();

  useEffect(() => {
    dispatch(fetchPosts({ limit, skip: (page - 1) * limit }));
  }, [dispatch, limit, page]);

  const handleScroll = debounce(() => {
    const container = containerRef.current;
    if (container) {
      const { scrollTop, clientHeight, scrollHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight && !reachedEnd) {
        setPage((prevPage) => prevPage + 1);
        setReachedEnd(true);
      }
    }
  }, 160);

  useEffect(() => {
    if (reachedEnd) {
      setReachedEnd(false);
    }
  }, [page, reachedEnd]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  if (loading && posts.length === 0) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div ref={containerRef} className={Style.list}>
      {posts.map((post, index) => (
        <motion.div
          key={`${post.id}-${index}`}
          viewport={{ once: true }}
          custom={index}
          initial="hidden"
          whileInView="visible"
          animate={controls}
          variants={variants}
          transition={{ delay: (index / page) * 0.01 }}
        >
          <Card
            key={`${post.id}-${index}`}
            style={{
              width: 300,
            }}
            title={post.title}
          >
            <div className={Style.body}>{post.body}</div>
            <div className={Style.tags}>
              {post.tags.map((tag) => (
                <Tag key={tag} bordered={false}>
                  {tag}
                </Tag>
              ))}
            </div>
            <div className={Style.reactions}>
              <Statistic title="Reactions" value={post.reactions} />
            </div>
          </Card>
        </motion.div>
      ))}
      {loading && <Spin size="large" />}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default PostList;
