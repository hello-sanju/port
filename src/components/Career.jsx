    /* eslint-disable react/prop-types */
    /* eslint-disable react/display-name */
    import React, { useState,useMemo, useEffect, useRef, useCallback } from "react";
    import {
      Box,
      Input,
      VStack,
      Text,
      
      IconButton,
      useDisclosure,
      Collapse,
      Button,
    } from "@chakra-ui/react";
    import { Helmet } from "react-helmet-async";  // Import Helmet

    import {
    
      RingLoader,
      SyncLoader,
      ClipLoader,
    
    } from "react-spinners";
    
    import { motion } from "framer-motion";
    import ModalImage from "react-modal-image"; 

    import { FaArrowCircleUp, FaBars, FaTimes } from "react-icons/fa";

    import { useNavigate, useLocation } from "react-router-dom";
    import ReactPlayer from "react-player";
    import "../styles/Blogs.css";


    import { Link } from "react-router-dom";
    const BlogTitle = React.forwardRef(({ title, collection, onClick, location }, ref) => (
        <motion.div
          whileHover={{
            textDecoration: "underline",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => onClick(title, collection)}
          ref={ref}
          style={{ cursor: "pointer", marginLeft: location === "main" ? "100px" : "0" }} // Adjust marginLeft based on location
        >
          <Text
            fontWeight="bold"
            _hover={{ textDecoration: "none" }}
            color="#ffffff" // White text color
            fontFamily="Roboto, sans-serif"
            textAlign="left"
            p={2}
            style={{ fontSize: location === "main" ? "24px" : "20px" }} // Adjust font sizes based on location
          >
            <Link
              to={`/${collection}/${encodeURIComponent(title)}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {title}
            </Link>
          </Text>
        </motion.div>
      ));
      
    
    
    


    const Career = () => {
      const [blogsData, setBlogsData] = useState({
        careers: [],
        choice: [],
      });
      const [loading, setLoading] = useState(true);

      const [currentPage, setCurrentPage] = useState(1);
      const [postsPerPage] = useState(1); 
      const navigate = useNavigate();
      const titleRefs = useRef({});
      const { isOpen, onToggle } = useDisclosure();
      const [lastVisitedBlog, setLastVisitedBlog] = useState(null);

      const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func(...args);
          }, delay);
        };
      };
      
      const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
      };  
      const observer = useRef();

      const [searchQuery, setSearchQuery] = useState("");
      const [scrollProgress, setScrollProgress] = useState(0);
      const [remainingProgress, setRemainingProgress] = useState(100);

      const location = useLocation();
      const [clickedTitle, setClickedTitle] = useState(null);
      const scrollToTitle = (title, collection, isChildTitle) => {
        const titleRef = titleRefs.current[`${collection}-${title}`];
        if (titleRef) {
          titleRef.scrollIntoView({
            behavior: "smooth",
            block: isChildTitle ? "center" : "start",
          });
        }
      };

      const handleSearchChange = (event) => {
        const newQuery = event.target.value;
        setSearchQuery(newQuery);
        navigate(`/careers/search/${encodeURIComponent(newQuery)}`);
      };
      const fetchData = async (collection) => {
        try {
          const response = await fetch(
            `https://edu-back-j3mz.onrender.com/api/${collection}`
          );
          const responseData = await response.json();
          setBlogsData((prevData) => ({
            ...prevData,
            [collection]: responseData,
          }));
        } catch (error) {
          console.error(`Error fetching ${collection} data:`, error);
        }
      };

      const fetchDataForAllCollections = async () => {
        const collections = ["careers", "choice"];
        const promises = collections.map((collection) => fetchData(collection));
        await Promise.all(promises);
      };
      const filteredBlogs = (collection) => {
        const blogsCollection = blogsData[collection] || [];
        return blogsCollection.filter((blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }; 
    useEffect(() => {
  fetchDataForAllCollections().then(() => setLoading(false));
}, []);

      const debouncedSearchChange = useCallback(debounce(handleSearchChange, 500), []);
    
      useEffect(() => {
        debouncedSearchChange(searchQuery);
      }, [debouncedSearchChange, searchQuery]);
    
      const filteredBlogsMemoized = useMemo(() => {
        return Object.keys(blogsData).reduce((acc, collection) => {
          acc[collection] = filteredBlogs(collection);
          return acc;
        }, {});
      }, [blogsData]);
    
      const observeLastBlog = useCallback(
        (collection, node) => {
          if (observer.current) {
            observer.current.disconnect();
          }
    
          observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              // Implement your logic here if needed
            }
          });
    
          if (node) {
            observer.current.observe(node);
          }
        },
        [observer]
      );
    
      const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        const contentHeight = scrollHeight - clientHeight;
        const progress = (scrollTop / contentHeight) * 100;

        setScrollProgress(progress);

        const remaining = 100 - progress;
        setRemainingProgress(remaining);
      };

      const scrollToTop = () => {
        const container = document.getElementById("blogs-section");
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      };
       
  const handleTitleClick = useCallback((title, collection) => {
        const encodedTitle = encodeURIComponent(title);
        const matchingBlog = blogsData[collection].find((blog) => blog.title === title);
    
        if (matchingBlog) {
          const pageIndex =
            Math.ceil(blogsData[collection].indexOf(matchingBlog) / postsPerPage) + 1;
    
          navigate(`/${collection}/${encodedTitle}`, {
            replace: true,
          });
    
          setCurrentPage(pageIndex);
    
          // Set the title dynamically when a title is clicked
          document.title = `${matchingBlog.title} | Eduxcel`; // Replace with your website name
        }
        setLastVisitedBlog({ title, collection });
      }, [blogsData, navigate, postsPerPage]);
    
  useEffect(() => {
    const query = location.pathname.split("/careers/search/")[1] || "";
    setSearchQuery(decodeURIComponent(query));
    fetchDataForAllCollections();

    if (clickedTitle) {
      // Reset the clicked title state
      setClickedTitle(null);
    }

    // Check for title in URL and display the content directly
    const urlTitleMatch = location.pathname.match(/(.+?)\/(.+)/);
    if (urlTitleMatch) {
      const [, collection, encodedTitle] = urlTitleMatch;
      const urlTitle = decodeURIComponent(encodedTitle);
      const matchingBlog = blogsData[collection]?.find(
        (blog) =>
          blog.title === urlTitle ||
          (blog.parentTitle && blog.parentTitle.title === urlTitle) ||
          (blog.extension1 && blog.extension1.title === urlTitle) ||
          (blog.extension2 && blog.extension2.title === urlTitle) ||
          (blog.extension3 && blog.extension3.title === urlTitle) ||
          (blog.extension4 && blog.extension4.title === urlTitle) ||
          (blog.extension5 && blog.extension5.title === urlTitle) ||
          (blog.needForAdvancedTechniques && blog.needForAdvancedTechniques.title === urlTitle) ||
          (blog.dask && blog.dask.title === urlTitle) ||
          (blog.vaex && blog.vaex.title === urlTitle) ||
          (blog.optimizationStrategies && blog.optimizationStrategies.title === urlTitle) ||
          (blog.parallelComputing && blog.parallelComputing.title === urlTitle) ||


          (blog.settingUpGit && blog.settingUpGit.title === urlTitle) ||

          (blog.configuringUsernameAndEmail && blog.configuringUsernameAndEmail.title === urlTitle) ||

          (blog.components && blog.components.title === urlTitle) ||
          (blog.settingUpJavaDevelopmentEnvironment && blog.settingUpJavaDevelopmentEnvironment.title === urlTitle) ||
          (blog.jvm && blog.jvm.title === urlTitle) ||
          (blog.features && blog.features.title === urlTitle) ||
          (blog.entry_level && blog.entry_level.title === urlTitle) ||

          // Add more checks for other extensions as needed
          // ...
          false
      );

      if (matchingBlog) {
  // Set the current page to the matched blog's page
  const pageIndex =
    Math.ceil(blogsData[collection].indexOf(matchingBlog) / postsPerPage) + 1;
  setCurrentPage(pageIndex);

  // Set the title and description dynamically for SEO
  const blogTitle = decodeURIComponent(matchingBlog.title);
  const cleanedBlogTitle = blogTitle.replace(/%20/g, ' ').replace(/%28/g, '(').replace(/%29/g, ')');
  const blogDescription = matchingBlog.overview
    ? matchingBlog.overview.join(' ')
    : matchingBlog.description || '';

  // Use Helmet to update the document head
  Helmet.canUseDOM && Helmet.startUpdating();
  Helmet.canUseDOM &&
    Helmet.updateHelmet({
      title: `${cleanedBlogTitle} | Eduxcel`,
      meta: [
        {
          name: 'description',
          content: blogDescription,
        },
      ],
    });
  Helmet.canUseDOM && Helmet.stopUpdating();
}
      
    }
    if (lastVisitedBlog) {
      localStorage.setItem('lastVisitedBlog', JSON.stringify(lastVisitedBlog));
    }
  }, [location.pathname, clickedTitle, blogsData, fetchDataForAllCollections]);

      const indexOfLastPost = currentPage * postsPerPage;
      const indexOfFirstPost = indexOfLastPost - postsPerPage;
      const currentPosts = filteredBlogs("careers").slice(indexOfFirstPost, indexOfLastPost);

    

    const headerStyle = {
      position: "sticky",
      top:0,
      zIndex: 1,
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      padding: "1rem",
      backdropFilter: "blur(10px)",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "0 0 20px 20px", // Adds rounded corners at the bottom
      color: "#fff", // Text color
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "Poppins, sans-serif", // Modern sans-serif font
    };

   
      const progressBarStyle = {
        width: `${scrollProgress}%`,
        height: "4px",
        backgroundColor: "green",
        borderRadius: "2px",
        transition: "width 0.3s",
      };

      const remainingBarStyle = {
        width: `${remainingProgress}%`,
        height: "4px",
        backgroundColor: "lightgray",
        borderRadius: "2px",
      };

      const scrollToTopButtonStyle = {
        position: "fixed",
        bottom: "30px",
        right: "1px",
        zIndex: 2,
        background: "green",
        color: "white",
        borderRadius: "50%",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.3s",
        fontSize: "24px",
      };

      const contentSectionStyle = {
        borderRadius: "12px",
        marginLeft:"100px",
       justifyContent:"start",
       alignItems:"start",
      };
      
      
      const sidebarStyle = {
        position: "fixed",
        top: "190px",
        left: 0,
        height: "100%",
        width: "200px",
        backgroundColor: "black",
        borderRight: "1px solid lightgray",
        padding: "20px",
        zIndex: 2,
        transition: "left 0.3s",
        overflowX: "hidden",
        overflowY: "auto", 
  maxHeight: "calc(100% - 200px)", 
      };

      const toggleButtonStyle = {
        position: "fixed",
        top: "170px",
        transform: "translateY(-50%)",
        left: isOpen ? "240px" : "20px",
        zIndex: 2,
        background: isOpen ? "#e74c3c" : "#2ecc71", // Red when open, green when closed
        color: "white",
        borderRadius: "50%",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "left 0.3s, background 0.3s",
        border: "2px solid #fff", // White border
        fontSize: "12px",
      };

      // Rotating animation on toggle
      toggleButtonStyle.rotate = {
        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
        transition: "transform 0.3s",
      };

      // Hover effect
      toggleButtonStyle["&:hover"] = {
        background: isOpen ? "#c0392b" : "#27ae60", // Darker red when open, darker green when closed
      };

      // Pulse animation on hover
      toggleButtonStyle["&:hover"].pulse = {
        animation: "pulse 0.5s infinite",
      };

      // Keyframe animation for pulse
      toggleButtonStyle["@keyframes pulse"] = {
        "0%": {
          transform: "scale(1)",
        },
        "50%": {
          transform: "scale(1.2)",
        },
        "100%": {
          transform: "scale(1)",
        },
      };

      const renderMediaContent = (content, title) => {
        if (!content) {
          return null;
        }
      
        if (!Array.isArray(content)) {
          // If content is not an array, wrap it in an array to handle it uniformly
          content = [content];
        }
      
        return content.map((item, index) => {
          if (Array.isArray(item)) {
            return (
              <VStack key={index} align="start" spacing={2} mt={2}>
                {renderMediaContent(item, title)}
              </VStack>
            );
          }
      
          let element;
      
          if (typeof item === "object" && item.title) {
            // Display object field titles on the same page as the parent title
            element = (
              <VStack key={index} align="start" spacing={2} mt={2}>
                <BlogTitle
                  title={item.title}
                  collection="careers"
                  onClick={() => handleTitleClick(item.title, "careers")}
                />
                {renderMediaContent(item.description, title)}
                {renderMediaContent(item.installation, title)}
                {renderMediaContent(item.content, title)}
                {renderMediaContent(item.steps, title)}
                {renderMediaContent(item.career_path, title)}
                {renderMediaContent(item.entry_level, title)}


                 {renderMediaContent(item.components, title)}
                 {renderMediaContent(item.whatIsJdk, title)}
                                  {renderMediaContent(item.whatIsJvm, title)}



                {renderMediaContent(item.jvm, title)}
                
                {renderMediaContent(item.jdk, title)}

                {renderMediaContent(item.settingUpJavaDevelopmentEnvironment, title)}
                {renderMediaContent(item.overview, title)}
               {renderMediaContent(item.settings, title)} 
                
               {renderMediaContent(item.features, title)} 
              </VStack>
            );
          }
      
          if (typeof item === "string") {
            // Handle special characters
            const specialCharsRegex = /[*$~]([^*$~]+)[*$~]/;
const matchSpecialChars = item.match(specialCharsRegex);

if (matchSpecialChars) {
  const specialText = matchSpecialChars[1];
  const textBeforeSpecial = item.split(matchSpecialChars[0])[0];
  const textAfterSpecial = item.split(matchSpecialChars[0])[1];

  element = (
    <Text key={index}>
      {textBeforeSpecial}
      <span
  style={{
    fontWeight: matchSpecialChars[0] === '*' ? 'bold' : 'normal',
    color: matchSpecialChars[0] === '$' ? 'green' : matchSpecialChars[0] === '~' ? 'lime' : 'gold',
    fontStyle: matchSpecialChars[0] === '*' ? 'italic' : 'normal',
    textDecoration: 'none',
    fontSize: matchSpecialChars[0] === '$' ? '1.2em' : matchSpecialChars[0] === '~' ? '1.1em' : '1em',
  }}
>

   {specialText}
      </span>
      {textAfterSpecial}
    </Text>
  );
} else {              // Check for links
              const linkRegex = /@([^@]+)@/;
              const match = item.match(linkRegex);
      
              if (match) {
                // Handle links
                const link = match[1];
                const textBeforeLink = item.split(match[0])[0];
                const textAfterLink = item.split(match[0])[1];
      
                element = (
                  <Text key={index}>
                    {textBeforeLink}
                    <span
                      style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => window.open(link, "_blank")}
                    >
                      {link}
                    </span>
                    {textAfterLink}
                  </Text>
                );
              } else if (item.startsWith("http")) {
                // Handle images and videos
                if (item.match(/\.(jpeg|jpg|gif|png)$/)) {
                  element = (
                    <Box key={index} mb={2} className="image-container">
                      <ModalImage
                        small={item}
                        large={item}
                        alt={`Image ${index}`}
                        className="custom-modal-image"
                      />
                    </Box>
                  );
                } else if (item.match(/\.(mp4|webm|mkv)$/)) {
                  element = (
                    <Box
                      key={index}
                      position="relative"
                      paddingTop="56.25%"
                      width="100%"
                    >
                      <ReactPlayer
                        url={item}
                        controls
                        width="100%"
                        height="100%"
                        style={{ position: "absolute", top: 0, left: 0 }}
                      />
                    </Box>
                  );
                } else {
                  element = <Text key={index}>{item}</Text>;
                }
              } else {
                // Handle regular text
                element = <Text key={index}>{item}</Text>;
              }
            }
          }
      
          return <Box key={index} mb={2}>{element}</Box>;
        });
      };
      
      
      


      const navbarHeight = document.querySelector(".navbar")?.clientHeight || 0;
      return (
        <Box
          w="full"
          minH="100vh"
          mx="auto"
          d="flex"
          padding={`calc(${navbarHeight}px + 2rem) 2rem 2rem 2rem`}
          flexDir="column"
          alignItems="start"
          justifyContent="flex-start"
          id="blogs-section"
          overflowY="scroll"
          textAlign={"left"}
          maxHeight="calc(100vh - 100px)"
          height="auto"
          overflowX="hidden"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
          onScroll={handleScroll}
          mt="0px"
        >
          {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          {loading && (
                    <>
                    <div style={{ marginRight: "20px" }}>
                      <ClipLoader color={"#FF6347"} loading={loading} size={20} />
                      <span style={{ color: "#FF6347", fontSize: "12px" }}>Fetching data...</span>
                    </div>
          
                    <div style={{ marginRight: "20px" }}>
                      <RingLoader color={"#36D7B7"} loading={loading} size={30} />
                      <span style={{ color: "#36D7B7", fontSize: "14px" }}>Preparing content...</span>
                    </div>
          
                    <div>
                      <SyncLoader color={"#5E35B1"} loading={loading} size={40} />
                      <span style={{ color: "#5E35B1", fontSize: "16px" }}>Almost there...</span>
                    </div>
                    {/* Add more loaders or customize the existing ones */}
                  </>
          
          )}
        </div>
         
          ) : (
            <>
              {/* Toggle Button */}
              <Button
                style={toggleButtonStyle}
                onClick={onToggle}
                leftIcon={isOpen ? <FaTimes /> : <FaBars />}
              >
                {isOpen ? "Close" : "Open"}
              </Button>
      
              {/* Sidebar */}
              <Collapse in={isOpen}>
                <Box style={sidebarStyle}>
                <VStack align="start" spacing={2}>
  {Object.keys(blogsData).map((collection) => (
    <VStack key={collection} align="start" spacing={2}>
      <Text fontSize="md" fontWeight="semibold" mb={2}>
        {`${collection.charAt(0).toUpperCase()}${collection.slice(1)}`}
      </Text>
      {filteredBlogs(collection).map((blog) => (
       <BlogTitle
       key={blog.title}
       title={blog.title}
       collection={collection}
       onClick={(title, collection) => handleTitleClick(title, collection)}
       location="sidebar" // Pass location prop indicating main content area
     />
     
      ))}
    </VStack>
  ))}
</VStack>


                </Box>
              </Collapse>
      
              {/* Main Content */}
              <Box mt={0} p={0} ml={isOpen ? "200px" : "0"}>
                <Box style={headerStyle}>
                  <VStack spacing={0} align="start" w="100%" marginTop="0">
                    <Input
                      type="text"
                      placeholder="Enter your desired job title or keywords"






                      value={searchQuery}
                      onChange={handleSearchChange}
                      p={0}
                      marginTop={0}
                      borderWidth="5px"
                      rounded="md"
                      bg="white"
                      color="black"
                      mb={0}
                    />
                    <Box style={progressBarStyle} />
                    <Box style={remainingBarStyle} />
                  </VStack>
                  <IconButton
                    icon={<FaArrowCircleUp />}
                    aria-label="Scroll to Top"
                    onClick={scrollToTop}
                    style={scrollToTopButtonStyle}
                  />
                </Box>
      
                {currentPosts.map((blog, index) => (
                  <motion.div
                    key={blog.title}
                    ref={
                      index === currentPosts.length - 1
                        ? (node) => observeLastBlog("careers", node)
                        : null
                    }
                  >
                    <VStack align="start" spacing={2} id={`title-${blog.title}`} ref={(el) => (titleRefs.current[blog.title] = el)}>
                      <BlogTitle
                        key={blog.title}
                        title={blog.title}
                        collection="careers"
                        onClick={() => handleTitleClick(blog.title, "careers")}
                        location="main" // Pass location prop indicating sidebar

                      />
                     </VStack>
       <VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.overview, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-description`} style={contentSectionStyle}>
  {renderMediaContent(blog.description, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-responsibilities`} style={contentSectionStyle}>
  {renderMediaContent(blog.responsibilities, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-skills`} style={contentSectionStyle}>
  {renderMediaContent(blog.skills, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-career_path`} style={contentSectionStyle}>
  {renderMediaContent(blog.career_path, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-entry_level`} style={contentSectionStyle}>
  {renderMediaContent(blog.entry_level, blog.title)}
</VStack>
{/* new  */}
<VStack spacing={2} id={`content-${blog.title}-career_outlook`} style={contentSectionStyle}>
  {renderMediaContent(blog.career_outlook, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-common_questions`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_questions, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-entry_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.entry_level, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-mid_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.mid_level, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-senior_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.senior_level, blog.title)}
</VStack>














<VStack spacing={2} id={`content-${blog.title}-best_practice`} style={contentSectionStyle}>
  {renderMediaContent(blog.best_practice, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-common_issues`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_issues, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-common_tasks`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_tasks, blog.title)}
</VStack>







 



      

                  </motion.div>
                ))}
      
              </Box>
            </>
          )}
        </Box>
      );
      };
      
      export default Career;
      