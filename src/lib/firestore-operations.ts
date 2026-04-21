import { db, storage } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { mathPageContent } from "./math-page-content";
import { getSiteUrl } from "./config";

// Upload math page content to Firestore
export const uploadMathPageContent = async () => {
  try {
    const docRef = doc(db, "pages", "math");
    await setDoc(docRef, {
      ...mathPageContent,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: "Math page content uploaded successfully to Firestore!",
    };
  } catch (error) {
    console.error("Error uploading math page content:", error);
    return {
      success: false,
      message: `Failed to upload content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get math page content from Firestore
export const getMathPageContent = async () => {
  try {
    const docRef = doc(db, "pages", "math");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: "Math page content retrieved successfully!",
      };
    } else {
      return {
        success: false,
        message: "No math page content found in Firestore",
      };
    }
  } catch (error) {
    console.error("Error getting math page content:", error);
    return {
      success: false,
      message: `Failed to retrieve content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload custom content to Firestore
export const uploadCustomMathContent = async (content: any) => {
  try {
    const docRef = doc(db, "pages", "math");
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: "Custom math page content uploaded successfully to Firestore!",
    };
  } catch (error) {
    console.error("Error uploading custom math page content:", error);
    return {
      success: false,
      message: `Failed to upload custom content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all pages from Firestore
export const getAllPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "pages"));
    const pages: any = {};

    querySnapshot.forEach((doc) => {
      pages[doc.id] = doc.data();
    });

    return {
      success: true,
      data: pages,
      message: "All pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    const querySnapshot = await getDocs(collection(db, "pages"));
    console.log(
      "Successfully connected to Firebase. Pages collection size:",
      querySnapshot.size
    );
    return {
      success: true,
      message: "Firebase connection successful",
      pagesCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return {
      success: false,
      message: `Firebase connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Blog Operations
export const getAllBlogs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"));
    const blogs: any[] = [];

    querySnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by date (newest first)
    blogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: true,
      data: blogs,
      message: "All blogs retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all blogs:", error);
    return {
      success: false,
      message: `Failed to retrieve blogs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const getBlogContent = async (blogId: string) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Blog content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No blog found with ID: ${blogId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting blog content:`, error);
    return {
      success: false,
      message: `Failed to retrieve blog content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const uploadBlogContent = async (blogId: string, content: any) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: `Blog content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(`Error uploading blog content:`, error);
    return {
      success: false,
      message: `Failed to upload blog content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const deleteBlogContent = async (blogId: string) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Blog deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting blog:`, error);
    return {
      success: false,
      message: `Failed to delete blog: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all blog categories
export const getAllBlogCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogCategories"));
    const categories: any[] = [];

    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: categories,
      message: "All blog categories retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting blog categories:", error);
    return {
      success: false,
      message: `Failed to retrieve blog categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new blog category
export const addBlogCategory = async (categoryName: string) => {
  try {
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "blogCategories", categoryId);
    await setDoc(docRef, {
      name: categoryName,
      slug: categoryId,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Category "${categoryName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding blog category:`, error);
    return {
      success: false,
      message: `Failed to add blog category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get blogs by category
export const getBlogsByCategory = async (category: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"));
    const blogs: any[] = [];

    querySnapshot.forEach((doc) => {
      const blogData = doc.data();
      if (blogData.category === category) {
        blogs.push({
          id: doc.id,
          ...blogData,
        });
      }
    });

    // Sort by date (newest first)
    blogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: true,
      data: blogs,
      message: `Blogs in category "${category}" retrieved successfully!`,
    };
  } catch (error) {
    console.error("Error getting blogs by category:", error);
    return {
      success: false,
      message: `Failed to retrieve blogs by category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== ROUTE RESOLVER ====================

// Check if a slug is a pillar page (not TEAS which is homepage)
export const isPillarPage = async (slug: string): Promise<boolean> => {
  try {
    // Special case: "teas" is the homepage, not a pillar page route
    if (slug === "teas" || slug === "" || !slug) {
      return false;
    }

    const result = await getPillarPageContent(slug);
    return result.success && result.data !== null;
  } catch {
    return false;
  }
};

// ==================== PILLAR PAGES OPERATIONS ====================

// Get all pillar pages from Firestore
export const getAllPillarPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "pillarPages"));
    const pillarPages: any[] = [];

    querySnapshot.forEach((doc) => {
      pillarPages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: pillarPages,
      message: "All pillar pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all pillar pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pillar pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get pillar page content from Firestore by pillar page ID
export const getPillarPageContent = async (pillarPageId: string) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Pillar page ${pillarPageId} content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No pillar page content found for ${pillarPageId} in Firestore`,
      };
    }
  } catch (error) {
    console.error(`Error getting pillar page ${pillarPageId} content:`, error);
    return {
      success: false,
      message: `Failed to retrieve pillar page ${pillarPageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload pillar page content to Firestore by pillar page ID
export const uploadPillarPageContent = async (
  pillarPageId: string,
  content: any
) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Pillar page ${pillarPageId} content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(
      `Error uploading pillar page ${pillarPageId} content:`,
      error
    );
    return {
      success: false,
      message: `Failed to upload pillar page ${pillarPageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete pillar page content from Firestore by pillar page ID
export const deletePillarPageContent = async (pillarPageId: string) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Pillar page ${pillarPageId} deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting pillar page ${pillarPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete pillar page ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Initialize dummy content for Nursing Exit Exam
export const initializeNursingExitExamContent = async () => {
  try {
    const dummyContent = {
      meta: {
        title: "Nursing Exit Exam | TeasGurus",
        description:
          "Comprehensive guide to nursing exit exams. Prepare for your nursing exit exam with expert resources, practice questions, and study guides.",
        keywords:
          "nursing exit exam, nursing school exit exam, NCLEX preparation, nursing graduation exam, exit exam study guide",
        ogTitle: "Nursing Exit Exam | TeasGurus",
        ogDescription:
          "Comprehensive guide to nursing exit exams. Prepare for your nursing exit exam with expert resources, practice questions, and study guides.",
        ogImage: "/nursing-mocks-logo.png",
        canonicalUrl: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"
        }/nursing-exit-exam`,
      },
      schema: "",
      hero: {
        badge: "We are Teas Gurus",
        title: "Nursing Exit Exam",
        subtitle: "Your comprehensive guide to success",
        description:
          "<p>Prepare for your nursing exit exam with confidence. Our comprehensive resources, practice questions, and expert guidance will help you succeed in your final nursing school assessment.</p>",
      },
      trustIndicators: [
        {
          title: "Expert Guidance",
          icon: "star",
        },
        {
          title: "Comprehensive Resources",
          icon: "book",
        },
        {
          title: "Proven Success",
          icon: "trophy",
        },
        {
          title: "24/7 Support",
          icon: "clock",
        },
      ],
      whatToExpect: {
        badge: "What to Expect",
        title: "Understanding the Nursing Exit Exam",
        subtitle:
          "<p>Learn what to expect on your nursing exit exam and how to prepare effectively.</p>",
        cards: [
          {
            title: "Exam Format",
            icon: "book",
            content: [
              "<p>Multiple-choice questions covering all nursing fundamentals</p>",
              "<p>Clinical scenario-based questions</p>",
              "<p>Time-limited assessment</p>",
            ],
          },
          {
            title: "Preparation Tips",
            icon: "lightbulb",
            content: [
              "<p>Review all core nursing concepts</p>",
              "<p>Practice with sample questions</p>",
              "<p>Create a study schedule</p>",
            ],
          },
        ],
        footer:
          "<p>With proper preparation and the right resources, you can excel on your nursing exit exam.</p>",
      },
      mostCommonQuestions: {
        badge: "Common Questions",
        title: "Most Common Questions About Nursing Exit Exams",
        subtitle:
          "Find answers to frequently asked questions about nursing exit exams.",
        cards: [
          {
            title: "What is a nursing exit exam?",
            content: [
              "<p>A nursing exit exam is a comprehensive assessment taken by nursing students before graduation to evaluate their readiness for the NCLEX and professional practice.</p>",
            ],
          },
          {
            title: "How should I prepare?",
            content: [
              "<p>Start early, review all core concepts, practice with sample questions, and utilize study guides and resources.</p>",
            ],
          },
        ],
      },
      studyGuide: {
        badge: "Study Guide",
        title: "Comprehensive Study Guide",
        subtitle:
          "<p>Access our comprehensive study materials to help you prepare for your nursing exit exam.</p>",
        sections: [
          {
            title: "Fundamentals",
            icon: "book",
            content:
              "<p>Review essential nursing fundamentals and core concepts.</p>",
          },
          {
            title: "Practice Questions",
            icon: "lightbulb",
            content:
              "<p>Access thousands of practice questions with detailed explanations.</p>",
          },
          {
            title: "Study Plans",
            icon: "clock",
            content:
              "<p>Follow structured study plans designed for success.</p>",
          },
          {
            title: "Expert Tips",
            icon: "star",
            content:
              "<p>Learn from nursing experts and successful graduates.</p>",
          },
        ],
      },
      privacyPricing: [
        {
          title: "Privacy & Security",
          icon: "shield",
          content:
            "<p>Your data is secure and private. We never share your information with third parties.</p>",
        },
        {
          title: "Affordable Pricing",
          icon: "star",
          content:
            "<p>Access comprehensive resources at affordable prices. Multiple pricing plans available.</p>",
        },
      ],
      faq: {
        title: "Frequently Asked Questions",
        subtitle:
          "<p>Find answers to common questions about nursing exit exams and our preparation resources.</p>",
        questions: [
          {
            question: "What topics are covered on the nursing exit exam?",
            paragraphs: [
              "<p>The nursing exit exam typically covers all core nursing concepts including fundamentals, medical-surgical nursing, pharmacology, pathophysiology, and nursing care across the lifespan.</p>",
            ],
          },
          {
            question: "How long does it take to prepare for the exit exam?",
            paragraphs: [
              "<p>Preparation time varies, but most students benefit from 4-8 weeks of focused study. Start early and create a consistent study schedule.</p>",
            ],
          },
          {
            question: "Are practice questions available?",
            paragraphs: [
              "<p>Yes, we provide thousands of practice questions with detailed explanations to help you prepare effectively.</p>",
            ],
          },
        ],
      },
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    };

    const docRef = doc(db, "pillarPages", "nursing-exit-exam");
    await setDoc(docRef, dummyContent);

    return {
      success: true,
      message: "Nursing Exit Exam dummy content initialized successfully!",
    };
  } catch (error) {
    console.error("Error initializing Nursing Exit Exam content:", error);
    return {
      success: false,
      message: `Failed to initialize content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get service page content under a pillar page
export const getPillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Service page ${servicePageId} under ${pillarPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No service page content found for ${pillarPageId}/${servicePageId} in Firestore`,
      };
    }
  } catch (error) {
    console.error(
      `Error getting service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload service page content under a pillar page
export const uploadPillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Service page ${servicePageId} under ${pillarPageId} uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(
      `Error uploading service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to upload service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete service page content under a pillar page
export const deletePillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Service page ${servicePageId} under ${pillarPageId} deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(
      `Error deleting service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to delete service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all service pages under a pillar page
export const getAllPillarServicePages = async (pillarPageId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", pillarPageId, "services")
    );
    const servicePages: any[] = [];

    querySnapshot.forEach((doc) => {
      servicePages.push({
        id: doc.id,
        servicePageId: doc.id,
        pillarPageId: pillarPageId,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: servicePages,
      message: `All service pages under ${pillarPageId} retrieved successfully!`,
    };
  } catch (error) {
    console.error(
      `Error getting all service pages under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve service pages under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING ENTRANCE EXAM SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-entrance-exam
export const getNursingEntranceExamSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-entrance-exam", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content (searches by slug field, falls back to document ID for backward compatibility)
export const getNursingEntranceExamSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-entrance-exam";
    const normalizedSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // First, try to find by slug field
    const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
    const slugQuery = query(subPagesRef, where("slug", "==", normalizedSlug));
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          subPageId: doc.id,
          ...doc.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          subPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content (uses auto-generated document IDs, slug stored as field)
export const uploadNursingEntranceExamSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-entrance-exam";
    const newSlug = content.slug?.trim() || subPageId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const slugQuery = query(
        subPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary keys: content, hero, image
      const { content: _, hero: __, image: ___, ...cleanContent } = content;

      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const newDocRef = await addDoc(subPagesRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        status: cleanContent.status || "Published", // Default to Published for new pages
        type: "sub",
        parentId: pillarId, // Parent is the pillar page
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${newDocRef.id}`;
      const docRef = doc(db, "pillarPages", pillarId, "subPages", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Check if the new slug is different and already exists (for another page)
    const oldSlugForComparison = currentSlug || normalizedOldSlug;
    if (normalizedNewSlug !== oldSlugForComparison) {
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${docId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    }

    // Remove unnecessary keys: content, hero, image
    const { content: _, hero: __, image: ___, ...cleanContent } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${docId}`;
    const docRef = doc(db, "pillarPages", pillarId, "subPages", docId);
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug, // Update slug field
        type: "sub",
        parentId: pillarId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "sub",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Sub-page updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingEntranceExamSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-entrance-exam";
    const refPath = `pillarPages/${pillarId}/subPages/${subPageId}`;

    // Delete the document
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId,
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== KNOWLEDGE BASE ARTICLES OPERATIONS ====================

// Upload/update KB article content (saves to "knowledgeBase" collection)
export const uploadNursingEntranceExamKbArticle = async (
  kbArticleId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-entrance-exam";
    const newSlug = content.slug?.trim() || kbArticleId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = kbArticleId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const kbArticlesRef = collection(db, "knowledgeBase");
      const slugQuery = query(
        kbArticlesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary keys: content, hero, image
      const { content: _, hero: __, image: ___, ...cleanContent } = content;

      // Prepare KB article data with all required fields
      const kbArticleData = {
        pageName: cleanContent.pageName || "",
        slug: normalizedNewSlug,
        status: cleanContent.status || "Published",
        heading: cleanContent.heading || "",
        description: cleanContent.description || "",
        seoLabel: cleanContent.seoLabel || cleanContent.pageName || "",
        seoSlug: normalizedNewSlug,
        meta: cleanContent.meta || {
          title: `${cleanContent.pageName || ""} | Nursing Entrance Exam`,
          description: `KB Article: ${
            cleanContent.pageName || ""
          } under Nursing Entrance Exam.`,
          keywords: `${
            cleanContent.pageName || ""
          }, nursing entrance exam, knowledge base`,
          ogTitle: `${cleanContent.pageName || ""} | Nursing Entrance Exam`,
          ogDescription: `KB Article: ${
            cleanContent.pageName || ""
          } under Nursing Entrance Exam.`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedNewSlug}`,
        },
        schema: cleanContent.schema || "",
        bodyContent: cleanContent.bodyContent || "",
        type: "kb",
        parentId: cleanContent.parentId || cleanContent.parentSubPageId || "",
        pillarId: pillarId,
        contentPath: "", // Will be set after document creation
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
        tags: cleanContent.tags || [],
        isFeatured: cleanContent.isFeatured || false,
        isFaq: cleanContent.isFaq || false,
        isStudentFacing: cleanContent.isStudentFacing || true,
        readingTimeMinutes: cleanContent.readingTimeMinutes || 0,
        difficultyLevel: cleanContent.difficultyLevel || "",
        authorId: cleanContent.authorId || "",
        authorName: cleanContent.authorName || "",
        source: cleanContent.source || "",
        relatedArticleIds: cleanContent.relatedArticleIds || [],
        relatedQuizIds: cleanContent.relatedQuizIds || [],
        viewsCount: cleanContent.viewsCount || 0,
        helpfulVotes: cleanContent.helpfulVotes || 0,
        notHelpfulVotes: cleanContent.notHelpfulVotes || 0,
        publishedAt: cleanContent.publishedAt || new Date().toISOString(),
        createdAt: cleanContent.createdAt || new Date().toISOString(),
        skillId: cleanContent.skillId || "",
      };

      const kbArticlesRef = collection(db, "knowledgeBase");
      const newDocRef = await addDoc(kbArticlesRef, kbArticleData);

      // Update contentPath with the actual document ID
      const contentPath = `knowledgeBase/${newDocRef.id}`;
      const docRef = doc(db, "knowledgeBase", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub", // Using "sub" type for KB articles for now, can be changed to "kb" if needed
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `KB Article created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it
    // Check if the new slug is different and already exists (for another page)
    const oldSlugForComparison = currentSlug || normalizedOldSlug;
    if (normalizedNewSlug !== oldSlugForComparison) {
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `knowledgeBase/${docId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    }

    // Remove unnecessary keys: content, hero, image
    const { content: _, hero: __, image: ___, ...cleanContent } = content;

    const contentPath = `knowledgeBase/${docId}`;
    const docRef = doc(db, "knowledgeBase", docId);

    // Prepare updated KB article data
    const updatedKbArticleData = {
      ...cleanContent,
      slug: normalizedNewSlug,
      type: "kb",
      parentId: cleanContent.parentId || cleanContent.parentSubPageId || "",
      pillarId: pillarId,
      contentPath: contentPath,
      lastUpdated: new Date().toISOString(),
      version: cleanContent.version || "1.0",
    };

    await setDoc(docRef, updatedKbArticleData, { merge: true });

    // Update route mapping
    await createRouteMapping({
      type: "sub", // Using "sub" type for KB articles for now
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `KB Article updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to upload KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all KB articles for nursing-entrance-exam pillar
export const getNursingEntranceExamKbArticles = async () => {
  try {
    const pillarId = "nursing-entrance-exam";
    const kbArticlesRef = collection(db, "knowledgeBase");

    // Query KB articles where pillarId matches
    const q = query(kbArticlesRef, where("pillarId", "==", pillarId));
    const querySnapshot = await getDocs(q);

    const kbArticles: any[] = [];
    querySnapshot.forEach((doc) => {
      kbArticles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: kbArticles,
      message: "KB articles retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting KB articles:", error);
    return {
      success: false,
      message: `Failed to retrieve KB articles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a single KB article by ID for nursing-entrance-exam
export const getNursingEntranceExamKbArticle = async (kbArticleId: string) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Verify it belongs to the correct pillar
      if (data.pillarId === "nursing-entrance-exam") {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...data,
          },
          message: `KB article ${kbArticleId} retrieved successfully!`,
        };
      } else {
        return {
          success: false,
          message: `KB article ${kbArticleId} does not belong to nursing-entrance-exam pillar`,
        };
      }
    } else {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }
  } catch (error) {
    console.error(`Error getting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete KB article
export const deleteNursingEntranceExamKbArticle = async (
  kbArticleId: string
) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }

    const docData = docSnap.data();
    const refPath = docData.contentPath || `knowledgeBase/${kbArticleId}`;

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);

    // Delete the KB article document
    await deleteDoc(docRef);

    return {
      success: true,
      message: `KB article ${kbArticleId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to delete KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK KB ARTICLES OPERATIONS ====================

// Upload/update KB article content for nursing-test-bank (saves to "knowledgeBase" collection)
export const uploadNursingTestBankKbArticle = async (
  kbArticleId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";
    const newSlug = content.slug?.trim() || kbArticleId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = kbArticleId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const kbArticlesRef = collection(db, "knowledgeBase");
      const slugQuery = query(
        kbArticlesRef,
        where("slug", "==", normalizedOldSlug),
        where("pillarId", "==", pillarId)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      const cleanContent = { ...content };
      delete cleanContent.id;
      delete cleanContent.subPageId;

      // Prepare KB article data with all required fields
      const kbArticleData = {
        pageName: cleanContent.pageName || "",
        slug: normalizedNewSlug,
        status: cleanContent.status || "published",
        heading: cleanContent.heading || "",
        description: cleanContent.description || "",
        seoLabel: cleanContent.seoLabel || "",
        seoSlug: cleanContent.seoSlug || "",
        meta: {
          title: cleanContent.meta?.title || "",
          description: cleanContent.meta?.description || "",
          keywords: cleanContent.meta?.keywords || "",
          ogTitle: cleanContent.meta?.ogTitle || "",
          ogDescription: cleanContent.meta?.ogDescription || "",
          ogImage: cleanContent.meta?.ogImage || "",
          canonicalUrl: cleanContent.meta?.canonicalUrl || "",
        },
        schema: cleanContent.schema || "",
        bodyContent: cleanContent.bodyContent || "",
        type: cleanContent.type || "kb-article",
        parentId: cleanContent.parentId || "",
        pillarId: pillarId,
        contentPath: "", // Will be set after document creation
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
        tags: cleanContent.tags || [],
        isFeatured: cleanContent.isFeatured || false,
        isFaq: cleanContent.isFaq || false,
        isStudentFacing: cleanContent.isStudentFacing || true,
        readingTimeMinutes: cleanContent.readingTimeMinutes || 0,
        difficultyLevel: cleanContent.difficultyLevel || "",
        authorId: cleanContent.authorId || "",
        authorName: cleanContent.authorName || "",
        source: cleanContent.source || "",
        relatedArticleIds: cleanContent.relatedArticleIds || [],
        relatedQuizIds: cleanContent.relatedQuizIds || [],
        viewsCount: cleanContent.viewsCount || 0,
        helpfulVotes: cleanContent.helpfulVotes || 0,
        notHelpfulVotes: cleanContent.notHelpfulVotes || 0,
        publishedAt: cleanContent.publishedAt || new Date().toISOString(),
        createdAt: cleanContent.createdAt || new Date().toISOString(),
        skillId: cleanContent.skillId || "",
      };

      const kbArticlesRef = collection(db, "knowledgeBase");
      const newDocRef = await addDoc(kbArticlesRef, kbArticleData);

      // Update contentPath with the actual document ID
      const contentPath = `knowledgeBase/${newDocRef.id}`;
      const docRef = doc(db, "knowledgeBase", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub", // Using "sub" type for KB articles for now, can be changed to "kb" if needed
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `KB Article created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it
    // Check if the new slug is different and already exists (for another page)
    if (normalizedNewSlug !== currentSlug && currentSlug !== null) {
      const kbArticlesRef = collection(db, "knowledgeBase");
      const slugCheckQuery = query(
        kbArticlesRef,
        where("slug", "==", normalizedNewSlug),
        where("pillarId", "==", pillarId)
      );
      const slugCheckSnapshot = await getDocs(slugCheckQuery);

      if (!slugCheckSnapshot.empty) {
        const existingDoc = slugCheckSnapshot.docs.find((d) => d.id !== docId);
        if (existingDoc) {
          return {
            success: false,
            message: `A KB article with slug "${normalizedNewSlug}" already exists.`,
          };
        }
      }
    }

    const cleanContent = { ...content };
    delete cleanContent.id;
    delete cleanContent.subPageId;

    const currentRefPath = `knowledgeBase/${docId}`;
    const contentPath = currentRefPath;
    const docRef = doc(db, "knowledgeBase", docId);

    const updatedKbArticleData = {
      ...cleanContent,
      slug: normalizedNewSlug,
      pillarId: pillarId,
      contentPath: contentPath,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(docRef, updatedKbArticleData, { merge: true });

    // Update route mapping
    await createRouteMapping({
      type: "sub", // Using "sub" type for KB articles for now
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `KB Article updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to upload KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all KB articles for nursing-test-bank pillar
export const getNursingTestBankKbArticles = async () => {
  try {
    const pillarId = "nursing-test-bank";
    const kbArticlesRef = collection(db, "knowledgeBase");

    // Query KB articles where pillarId matches
    const q = query(kbArticlesRef, where("pillarId", "==", pillarId));
    const querySnapshot = await getDocs(q);

    const kbArticles: any[] = [];
    querySnapshot.forEach((doc) => {
      kbArticles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: kbArticles,
      message: "KB articles retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting KB articles:", error);
    return {
      success: false,
      message: `Failed to retrieve KB articles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a single KB article by ID for nursing-test-bank
export const getNursingTestBankKbArticle = async (kbArticleId: string) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Verify it belongs to the correct pillar
      if (data.pillarId === "nursing-test-bank") {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...data,
          },
          message: `KB article ${kbArticleId} retrieved successfully!`,
        };
      } else {
        return {
          success: false,
          message: `KB article ${kbArticleId} does not belong to nursing-test-bank pillar`,
        };
      }
    } else {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }
  } catch (error) {
    console.error(`Error getting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete KB article for nursing-test-bank
export const deleteNursingTestBankKbArticle = async (kbArticleId: string) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }

    const docData = docSnap.data();
    const refPath = docData.contentPath || `knowledgeBase/${kbArticleId}`;

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);

    // Delete the KB article document
    await deleteDoc(docRef);

    return {
      success: true,
      message: `KB article ${kbArticleId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to delete KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING EXIT EXAM KB ARTICLES OPERATIONS ====================

// Upload/update KB article content for nursing-exit-exam (saves to "knowledgeBase" collection)
export const uploadNursingExitExamKbArticle = async (
  kbArticleId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-exit-exam";
    const newSlug = content.slug?.trim() || kbArticleId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = kbArticleId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const kbArticlesRef = collection(db, "knowledgeBase");
      const slugQuery = query(
        kbArticlesRef,
        where("slug", "==", normalizedOldSlug),
        where("pillarId", "==", pillarId)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      const cleanContent = { ...content };
      delete cleanContent.id;
      delete cleanContent.subPageId;

      // Prepare KB article data with all required fields
      const kbArticleData = {
        pageName: cleanContent.pageName || "",
        slug: normalizedNewSlug,
        status: cleanContent.status || "published",
        heading: cleanContent.heading || "",
        description: cleanContent.description || "",
        seoLabel: cleanContent.seoLabel || "",
        seoSlug: cleanContent.seoSlug || "",
        meta: {
          title: cleanContent.meta?.title || "",
          description: cleanContent.meta?.description || "",
          keywords: cleanContent.meta?.keywords || "",
          ogTitle: cleanContent.meta?.ogTitle || "",
          ogDescription: cleanContent.meta?.ogDescription || "",
          ogImage: cleanContent.meta?.ogImage || "",
          canonicalUrl: cleanContent.meta?.canonicalUrl || "",
        },
        schema: cleanContent.schema || "",
        bodyContent: cleanContent.bodyContent || "",
        type: cleanContent.type || "kb-article",
        parentId: cleanContent.parentId || "",
        pillarId: pillarId,
        contentPath: "", // Will be set after document creation
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
        tags: cleanContent.tags || [],
        isFeatured: cleanContent.isFeatured || false,
        isFaq: cleanContent.isFaq || false,
        isStudentFacing: cleanContent.isStudentFacing || true,
        readingTimeMinutes: cleanContent.readingTimeMinutes || 0,
        difficultyLevel: cleanContent.difficultyLevel || "",
        authorId: cleanContent.authorId || "",
        authorName: cleanContent.authorName || "",
        source: cleanContent.source || "",
        relatedArticleIds: cleanContent.relatedArticleIds || [],
        relatedQuizIds: cleanContent.relatedQuizIds || [],
        viewsCount: cleanContent.viewsCount || 0,
        helpfulVotes: cleanContent.helpfulVotes || 0,
        notHelpfulVotes: cleanContent.notHelpfulVotes || 0,
        publishedAt: cleanContent.publishedAt || new Date().toISOString(),
        createdAt: cleanContent.createdAt || new Date().toISOString(),
        skillId: cleanContent.skillId || "",
      };

      const kbArticlesRef = collection(db, "knowledgeBase");
      const newDocRef = await addDoc(kbArticlesRef, kbArticleData);

      // Update contentPath with the actual document ID
      const contentPath = `knowledgeBase/${newDocRef.id}`;
      const docRef = doc(db, "knowledgeBase", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub", // Using "sub" type for KB articles for now, can be changed to "kb" if needed
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `KB Article created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it
    // Check if the new slug is different and already exists (for another page)
    if (normalizedNewSlug !== currentSlug && currentSlug !== null) {
      const kbArticlesRef = collection(db, "knowledgeBase");
      const slugCheckQuery = query(
        kbArticlesRef,
        where("slug", "==", normalizedNewSlug),
        where("pillarId", "==", pillarId)
      );
      const slugCheckSnapshot = await getDocs(slugCheckQuery);

      if (!slugCheckSnapshot.empty) {
        const existingDoc = slugCheckSnapshot.docs.find((d) => d.id !== docId);
        if (existingDoc) {
          return {
            success: false,
            message: `A KB article with slug "${normalizedNewSlug}" already exists.`,
          };
        }
      }
    }

    const cleanContent = { ...content };
    delete cleanContent.id;
    delete cleanContent.subPageId;

    const currentRefPath = `knowledgeBase/${docId}`;
    const contentPath = currentRefPath;
    const docRef = doc(db, "knowledgeBase", docId);

    const updatedKbArticleData = {
      ...cleanContent,
      slug: normalizedNewSlug,
      pillarId: pillarId,
      contentPath: contentPath,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(docRef, updatedKbArticleData, { merge: true });

    // Update route mapping
    await createRouteMapping({
      type: "sub", // Using "sub" type for KB articles for now
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `KB Article updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to upload KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all KB articles for nursing-exit-exam pillar
export const getNursingExitExamKbArticles = async () => {
  try {
    const pillarId = "nursing-exit-exam";
    const kbArticlesRef = collection(db, "knowledgeBase");

    // Query KB articles where pillarId matches
    const q = query(kbArticlesRef, where("pillarId", "==", pillarId));
    const querySnapshot = await getDocs(q);

    const kbArticles: any[] = [];
    querySnapshot.forEach((doc) => {
      kbArticles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: kbArticles,
      message: "KB articles retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting KB articles:", error);
    return {
      success: false,
      message: `Failed to retrieve KB articles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a single KB article by ID for nursing-exit-exam
export const getNursingExitExamKbArticle = async (kbArticleId: string) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Verify it belongs to the correct pillar
      if (data.pillarId === "nursing-exit-exam") {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...data,
          },
          message: `KB article ${kbArticleId} retrieved successfully!`,
        };
      } else {
        return {
          success: false,
          message: `KB article ${kbArticleId} does not belong to nursing-exit-exam pillar`,
        };
      }
    } else {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }
  } catch (error) {
    console.error(`Error getting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete KB article for nursing-exit-exam
export const deleteNursingExitExamKbArticle = async (kbArticleId: string) => {
  try {
    const docRef = doc(db, "knowledgeBase", kbArticleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        message: `KB article ${kbArticleId} not found`,
      };
    }

    const docData = docSnap.data();
    const refPath = docData.contentPath || `knowledgeBase/${kbArticleId}`;

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);

    // Delete the KB article document
    await deleteDoc(docRef);

    return {
      success: true,
      message: `KB article ${kbArticleId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting KB article ${kbArticleId}:`, error);
    return {
      success: false,
      message: `Failed to delete KB article ${kbArticleId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING EXIT EXAM SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-exit-exam
export const getNursingExitExamSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-exit-exam", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content (searches by slug field, falls back to document ID for backward compatibility)
export const getNursingExitExamSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-exit-exam";
    const normalizedSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // First, try to find by slug field
    const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
    const slugQuery = query(subPagesRef, where("slug", "==", normalizedSlug));
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          subPageId: doc.id,
          ...doc.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          subPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content (uses auto-generated document IDs, slug stored as field)
export const uploadNursingExitExamSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-exit-exam";
    const newSlug = content.slug?.trim() || subPageId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let _currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      _currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const slugQuery = query(
        subPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        _currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary keys: content, hero, image
      const { content: _, hero: __, image: ___, ...cleanContent } = content;

      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const newDocRef = await addDoc(subPagesRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        status: cleanContent.status || "Published", // Default to Published for new pages
        type: "sub",
        parentId: pillarId, // Parent is the pillar page
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${newDocRef.id}`;
      const docRef = doc(db, "pillarPages", pillarId, "subPages", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Remove unnecessary keys: content, hero, image
    const { content: _, hero: __, image: ___, ...cleanContent } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${docId}`;
    const docRef = doc(db, "pillarPages", pillarId, "subPages", docId);
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug, // Update slug field
        type: "sub",
        parentId: pillarId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "sub",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Sub-page updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingExitExamSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-exit-exam";
    const refPath = `pillarPages/${pillarId}/subPages/${subPageId}`;

    // Delete the document
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId,
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NESTED SUB-PAGES OPERATIONS ====================

// Get all nested sub-pages under a specific sub-page (for entrance exam)
export const getNestedSubPages = async (parentSubPageId: string) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all nested sub-pages under a specific sub-page (for exit exam)
export const getNursingExitExamNestedSubPages = async (
  parentSubPageId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific nested sub-page content (for exit exam) - searches by slug field, falls back to document ID
export const getNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";
    const normalizedSlug = nestedSubPageId.toLowerCase().replace(/\s+/g, "-");

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // First, try to find by slug field
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const slugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          nestedSubPageId: doc.id,
          ...doc.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          nestedSubPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content (for exit exam) - uses auto-generated document IDs
export const uploadNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || nestedSubPageId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;

    // Find nested sub-page by document ID first (when editing, nestedSubPageId is the document ID)
    let nestedDocId: string | null = null;
    let currentSlug: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );

    // Try by document ID first (most common case when editing)
    const nestedDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const nestedDocSnap = await getDoc(nestedDocRef);
    if (nestedDocSnap.exists()) {
      nestedDocId = nestedDocSnap.id;
      currentSlug = nestedDocSnap.data()?.slug || null;
    } else {
      // Fallback: try by slug (for backward compatibility)
      const normalizedOldSlug = nestedSubPageId
        .toLowerCase()
        .replace(/\s+/g, "-");
      const nestedSlugQuery = query(
        nestedSubPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

      if (!nestedSlugSnapshot.empty) {
        nestedDocId = nestedSlugSnapshot.docs[0].id;
        currentSlug = nestedSlugSnapshot.docs[0].data()?.slug || null;
      }
    }

    if (!nestedDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
      const {
        trustIndicators: _trustIndicators,
        whatToExpect: _whatToExpect,
        mostCommonQuestions: _mostCommonQuestions,
        studyGuide: _studyGuide,
        privacyPricing: _privacyPricing,
        faq: _faq,
        ...cleanContent
      } = content;

      const newDocRef = await addDoc(nestedSubPagesRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "nested",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: newDocRef.id,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Nested sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Get current slug from document if not already retrieved
    if (currentSlug === null) {
      const existingDocSnap = await getDoc(nestedDocRef);
      if (existingDocSnap.exists()) {
        currentSlug = existingDocSnap.data()?.slug || null;
      }
    }
    const normalizedCurrentSlug = currentSlug
      ? currentSlug.toLowerCase().replace(/\s+/g, "-")
      : null;

    // Check if the new slug is different from the current slug
    if (normalizedCurrentSlug && normalizedNewSlug !== normalizedCurrentSlug) {
      // Slug is being changed, check if new slug is available
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    } else if (!normalizedCurrentSlug) {
      // Document exists but has no slug, check if new slug is available
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }
    }
    // If slug hasn't changed, no need to check availability

    // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
    const {
      trustIndicators: _trustIndicators,
      whatToExpect: _whatToExpect,
      mostCommonQuestions: _mostCommonQuestions,
      studyGuide: _studyGuide,
      privacyPricing: _privacyPricing,
      faq: _faq,
      ...cleanContent
    } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedDocId
    );
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "nested",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: nestedDocId,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Nested sub-page updated successfully!`,
      data: { id: nestedDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page (for exit exam)
export const deleteNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";
    const refPath = `pillarPages/${pillarId}/subPages/${parentSubPageId}/nestedSubPages/${nestedSubPageId}`;

    // Delete the document
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: parentSubPageId,
      nestedPageId: nestedSubPageId,
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-test-bank
export const getNursingTestBankSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-test-bank", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content
export const getNursingTestBankSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-test-bank";
    const normalizedSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // First, try to find by slug field
    const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
    const slugQuery = query(subPagesRef, where("slug", "==", normalizedSlug));
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const docData = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: docData.id,
          subPageId: docData.id,
          ...docData.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          subPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Sub-page ${subPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content (uses auto-generated document IDs, slug stored as field)
export const uploadNursingTestBankSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";
    const newSlug = content.slug?.trim() || subPageId;
    const normalizedNewSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedOldSlug = subPageId.toLowerCase().replace(/\s+/g, "-");

    // Find document by document ID first (since URL param is typically the document ID)
    // Then try by slug field as fallback
    let docId: string | null = null;
    let currentSlug: string | null = null;

    // First, try to find by document ID (most common case)
    const lookupDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(lookupDocRef);
    if (docSnap.exists()) {
      docId = docSnap.id;
      const docData = docSnap.data();
      currentSlug = docData.slug
        ? docData.slug.toLowerCase().replace(/\s+/g, "-")
        : null;
    } else {
      // Fallback: try to find by slug field
      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const slugQuery = query(
        subPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        docId = slugSnapshot.docs[0].id;
        currentSlug = normalizedOldSlug;
      }
    }

    if (!docId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary keys: content, hero, image
      const { content: _, hero: __, image: ___, ...cleanContent } = content;

      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const newDocRef = await addDoc(subPagesRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        status: cleanContent.status || "Published", // Default to Published for new pages
        type: "sub",
        parentId: pillarId, // Parent is the pillar page
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${newDocRef.id}`;
      const docRef = doc(db, "pillarPages", pillarId, "subPages", newDocRef.id);
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "sub",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: newDocRef.id,
        nestedPageId: null,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Check if the new slug is different and already exists (for another page)
    const oldSlugForComparison = currentSlug || normalizedOldSlug;
    if (normalizedNewSlug !== oldSlugForComparison) {
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${docId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    }

    // Remove unnecessary keys: content, hero, image
    const { content: _, hero: __, image: ___, ...cleanContent } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${docId}`;
    const docRef = doc(db, "pillarPages", pillarId, "subPages", docId);
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug, // Update slug field
        type: "sub",
        parentId: pillarId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "sub",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: docId,
      nestedPageId: null,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Sub-page updated successfully!`,
      data: { id: docId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingTestBankSubPage = async (subPageId: string) => {
  try {
    const pillarId = "nursing-test-bank";
    const refPath = `pillarPages/${pillarId}/subPages/${subPageId}`;

    // Delete the document
    const docRef = doc(db, "pillarPages", pillarId, "subPages", subPageId);
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId,
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all nested sub-pages under a specific sub-page (for test bank)
export const getNursingTestBankNestedSubPages = async (
  parentSubPageId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: [],
    };
  }
};

// Get a specific nested sub-page content (for test bank) - searches by slug field, falls back to document ID
export const getNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-test-bank";
    const normalizedSlug = nestedSubPageId.toLowerCase().replace(/\s+/g, "-");

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // First, try to find by slug field
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const slugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          nestedSubPageId: doc.id,
          ...doc.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          nestedSubPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content (for test bank) - uses auto-generated document IDs
export const uploadNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || nestedSubPageId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;

    // Find nested sub-page by document ID first (when editing, nestedSubPageId is the document ID)
    let nestedDocId: string | null = null;
    let currentSlug: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );

    // Try by document ID first (most common case when editing)
    const nestedDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const nestedDocSnap = await getDoc(nestedDocRef);
    if (nestedDocSnap.exists()) {
      nestedDocId = nestedDocSnap.id;
      currentSlug = nestedDocSnap.data()?.slug || null;
    } else {
      // Fallback: try by slug (for backward compatibility)
      const normalizedOldSlug = nestedSubPageId
        .toLowerCase()
        .replace(/\s+/g, "-");
      const nestedSlugQuery = query(
        nestedSubPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

      if (!nestedSlugSnapshot.empty) {
        nestedDocId = nestedSlugSnapshot.docs[0].id;
        currentSlug = nestedSlugSnapshot.docs[0].data()?.slug || null;
      }
    }

    if (!nestedDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
      const {
        trustIndicators: _trustIndicators,
        whatToExpect: _whatToExpect,
        mostCommonQuestions: _mostCommonQuestions,
        studyGuide: _studyGuide,
        privacyPricing: _privacyPricing,
        faq: _faq,
        ...cleanContent
      } = content;

      const newDocRef = await addDoc(nestedSubPagesRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "nested",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: newDocRef.id,
        topicId: null,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Nested sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Get current slug from document if not already retrieved
    if (currentSlug === null) {
      const existingDocSnap = await getDoc(nestedDocRef);
      if (existingDocSnap.exists()) {
        currentSlug = existingDocSnap.data()?.slug || null;
      }
    }
    const normalizedCurrentSlug = currentSlug
      ? currentSlug.toLowerCase().replace(/\s+/g, "-")
      : null;

    // Check if the new slug is different from the current slug
    if (normalizedCurrentSlug && normalizedNewSlug !== normalizedCurrentSlug) {
      // Slug is being changed, check if new slug is available
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    } else if (!normalizedCurrentSlug) {
      // Document exists but has no slug, check if new slug is available
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }
    }
    // If slug hasn't changed, no need to check availability

    // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
    const {
      trustIndicators: _trustIndicators,
      whatToExpect: _whatToExpect,
      mostCommonQuestions: _mostCommonQuestions,
      studyGuide: _studyGuide,
      privacyPricing: _privacyPricing,
      faq: _faq,
      ...cleanContent
    } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedDocId
    );
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "nested",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: nestedDocId,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Nested sub-page updated successfully!`,
      data: { id: nestedDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page (for test bank)
export const deleteNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-test-bank";
    const refPath = `pillarPages/${pillarId}/subPages/${parentSubPageId}/nestedSubPages/${nestedSubPageId}`;

    // Delete the document
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: parentSubPageId,
      nestedPageId: nestedSubPageId,
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK TOPICS OPERATIONS ====================

// Get all topics under a specific nested sub-page (for test bank)
export const getNursingTestBankTopics = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // Now query topics using resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics"
      )
    );
    const topics: any[] = [];

    querySnapshot.forEach((doc) => {
      topics.push({
        id: doc.id,
        topicId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: topics,
      message: "All topics retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting topics:", error);
    return {
      success: false,
      message: `Failed to retrieve topics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: [],
    };
  }
};

// Get a specific topic content (for test bank)
export const getNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Now get topic using resolved document IDs
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      topicId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Topic ${topicId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No topic content found for ${topicId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update topic content (for test bank) - uses auto-generated document IDs
export const uploadNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    // let parentSlug: string = "";
    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
      // const parentData = parentSlugSnapshot.docs[0].data();
      // parentSlug = (parentData.slug || parentSubPageId)
      //   .toLowerCase()
      //   .replace(/\s+/g, "-");
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
        // const parentData = parentDocSnap.data();
        // parentSlug = (parentData.slug || parentSubPageId)
        //   .toLowerCase()
        //   .replace(/\s+/g, "-");
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || topicId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;

    // Find topic by document ID first (when editing, topicId is the document ID)
    let topicDocId: string | null = null;
    let currentSlug: string | null = null;
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );

    // Try by document ID first (most common case when editing)
    const topicDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      topicId
    );
    const topicDocSnap = await getDoc(topicDocRef);
    if (topicDocSnap.exists()) {
      topicDocId = topicDocSnap.id;
      currentSlug = topicDocSnap.data()?.slug || null;
    } else {
      // Fallback: try by slug (for backward compatibility)
      const normalizedOldSlug = topicId.toLowerCase().replace(/\s+/g, "-");
      const topicSlugQuery = query(
        topicsRef,
        where("slug", "==", normalizedOldSlug)
      );
      const topicSlugSnapshot = await getDocs(topicSlugQuery);

      if (!topicSlugSnapshot.empty) {
        topicDocId = topicSlugSnapshot.docs[0].id;
        currentSlug = topicSlugSnapshot.docs[0].data()?.slug || null;
      }
    }

    if (!topicDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
      const {
        trustIndicators: _trustIndicators,
        whatToExpect: _whatToExpect,
        mostCommonQuestions: _mostCommonQuestions,
        studyGuide: _studyGuide,
        privacyPricing: _privacyPricing,
        faq: _faq,
        ...cleanContent
      } = content;

      const newDocRef = await addDoc(topicsRef, {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "topic",
        parentId: resolvedParentId,
        nestedSubPageId: resolvedNestedId,
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "topic",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: resolvedNestedId,
        topicId: newDocRef.id,
        quizId: null,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Topic created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Get current slug from document if not already retrieved
    if (currentSlug === null) {
      const existingDocSnap = await getDoc(topicDocRef);
      if (existingDocSnap.exists()) {
        currentSlug = existingDocSnap.data()?.slug || null;
      }
    }
    const normalizedCurrentSlug = currentSlug
      ? currentSlug.toLowerCase().replace(/\s+/g, "-")
      : null;

    // Check if the new slug is different from the current slug
    if (normalizedCurrentSlug && normalizedNewSlug !== normalizedCurrentSlug) {
      // Slug is being changed, check if new slug is available
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${topicDocId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    } else if (!normalizedCurrentSlug) {
      // Document exists but has no slug, check if new slug is available
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }
    }
    // If slug hasn't changed, no need to check availability

    // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
    const {
      trustIndicators: _trustIndicators,
      whatToExpect: _whatToExpect,
      mostCommonQuestions: _mostCommonQuestions,
      studyGuide: _studyGuide,
      privacyPricing: _privacyPricing,
      faq: _faq,
      ...cleanContent
    } = content;

    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${topicDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      topicDocId
    );
    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "topic",
        parentId: resolvedParentId,
        nestedSubPageId: resolvedNestedId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "topic",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId: topicDocId,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Topic updated successfully!`,
      data: { id: topicDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to upload topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete topic (for test bank)
export const deleteNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    const refPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${topicId}`;

    // Delete the document using resolved IDs
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      topicId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId,
    });

    return {
      success: true,
      message: `Topic ${topicId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to delete topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK QUIZZES OPERATIONS ====================

// Get all quizzes under a specific topic (for test bank)
export const getNursingTestBankQuizzes = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
          data: [],
        };
      }
    }

    // Now query quizzes using the resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes"
      )
    );
    const quizzes: any[] = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        quizId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: quizzes,
      message: "All quizzes retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quizzes:", error);
    return {
      success: false,
      message: `Failed to retrieve quizzes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: [],
    };
  }
};

// Get a specific quiz content (for test bank)
export const getNursingTestBankQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    // Get all quizzes to search by slug using resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes"
      )
    );

    // First, try to find by slug (this is the primary method for frontend access)
    for (const doc of querySnapshot.docs) {
      const quizData = doc.data();
      const quizSlug = quizData.slug || "";

      // Check if the slug matches (case-insensitive)
      if (quizSlug.toLowerCase() === quizId.toLowerCase()) {
        return {
          success: true,
          data: {
            id: doc.id,
            quizId: doc.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully by slug!`,
        };
      }
    }

    // If not found by slug, try by document ID (for admin panel backward compatibility)
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      quizId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quizData = docSnap.data();
      const quizSlug = quizData.slug || "";

      // Allow document ID access if:
      // 1. There's no slug set (old quiz without slug), OR
      // 2. The document ID matches the slug (backward compatibility), OR
      // 3. The document ID matches the quizId (allow access by document ID even if slug exists)
      if (
        !quizSlug ||
        quizSlug.toLowerCase() === quizId.toLowerCase() ||
        docSnap.id.toLowerCase() === quizId.toLowerCase()
      ) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            quizId: docSnap.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully!`,
        };
      }
    }

    // If still not found, return error
    return {
      success: false,
      message: `No quiz content found for ${quizId}`,
    };
  } catch (error) {
    console.error(`Error getting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update quiz content (for test bank) - uses auto-generated document IDs
export const uploadNursingTestBankQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    // let parentSlug: string = "";
    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
      // const parentData = parentSlugSnapshot.docs[0].data();
      // parentSlug = (parentData.slug || parentSubPageId)
      //   .toLowerCase()
      //   .replace(/\s+/g, "-");
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
        // const parentData = parentDocSnap.data();
        // parentSlug = (parentData.slug || parentSubPageId)
        //   .toLowerCase()
        //   .replace(/\s+/g, "-");
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    // let nestedSlug: string = "";
    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
      // const nestedData = nestedSlugSnapshot.docs[0].data();
      // nestedSlug = (nestedData.slug || nestedSubPageId)
      //   .toLowerCase()
      //   .replace(/\s+/g, "-");
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
        // const nestedData = nestedDocSnap.data();
        // nestedSlug = (nestedData.slug || nestedSubPageId)
        //   .toLowerCase()
        //   .replace(/\s+/g, "-");
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || quizId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;
    const normalizedOldSlug = quizId.toLowerCase().replace(/\s+/g, "-");

    // Find quiz by slug (or document ID for backward compatibility)
    let quizDocId: string | null = null;
    const quizzesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes"
    );
    const quizSlugQuery = query(
      quizzesRef,
      where("slug", "==", normalizedOldSlug)
    );
    const quizSlugSnapshot = await getDocs(quizSlugQuery);

    if (!quizSlugSnapshot.empty) {
      quizDocId = quizSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const quizDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes",
        quizId
      );
      const quizDocSnap = await getDoc(quizDocRef);
      if (quizDocSnap.exists()) {
        quizDocId = quizDocSnap.id;
      }
    }

    if (!quizDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      const newDocRef = await addDoc(quizzesRef, {
        ...content,
        slug: normalizedNewSlug,
        type: "quiz",
        parentId: resolvedParentId,
        nestedSubPageId: resolvedNestedId,
        topicId: resolvedTopicId,
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${resolvedTopicId}/quizzes/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "quiz",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: resolvedNestedId,
        topicId: resolvedTopicId,
        quizId: newDocRef.id,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Quiz created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${resolvedTopicId}/quizzes/${quizDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      quizDocId
    );
    await setDoc(
      docRef,
      {
        ...content,
        slug: normalizedNewSlug, // Update slug field
        type: "quiz",
        parentId: resolvedParentId,
        nestedSubPageId: resolvedNestedId,
        topicId: resolvedTopicId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "quiz",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId: resolvedTopicId,
      quizId: quizDocId,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Quiz updated successfully!`,
      data: { id: quizDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to upload quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete quiz (for test bank)
export const deleteNursingTestBankQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    const refPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${resolvedTopicId}/quizzes/${quizId}`;

    // Delete the document using resolved IDs
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      quizId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId: resolvedTopicId,
      quizId,
    });

    return {
      success: true,
      message: `Quiz ${quizId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to delete quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific nested sub-page content (for entrance exam) - searches by slug field, falls back to document ID
export const getNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";
    const normalizedSlug = nestedSubPageId.toLowerCase().replace(/\s+/g, "-");

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // First, try to find by slug field
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const slugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          nestedSubPageId: doc.id,
          ...doc.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by slug!`,
      };
    }

    // Fallback: try by document ID for backward compatibility
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          nestedSubPageId: docSnap.id,
          ...docSnap.data(),
        },
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully by ID!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content (for entrance exam) - uses auto-generated document IDs
export const uploadNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || nestedSubPageId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;

    // Find nested sub-page by document ID first (when editing, nestedSubPageId is the document ID)
    let nestedDocId: string | null = null;
    let currentSlug: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );

    // Try by document ID first (most common case when editing)
    const nestedDocRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedSubPageId
    );
    const nestedDocSnap = await getDoc(nestedDocRef);
    if (nestedDocSnap.exists()) {
      nestedDocId = nestedDocSnap.id;
      currentSlug = nestedDocSnap.data()?.slug || null;
    } else {
      // Fallback: try by slug (for backward compatibility)
      const normalizedOldSlug = nestedSubPageId
        .toLowerCase()
        .replace(/\s+/g, "-");
      const nestedSlugQuery = query(
        nestedSubPagesRef,
        where("slug", "==", normalizedOldSlug)
      );
      const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

      if (!nestedSlugSnapshot.empty) {
        nestedDocId = nestedSlugSnapshot.docs[0].id;
        currentSlug = nestedSlugSnapshot.docs[0].data()?.slug || null;
      }
    }

    if (!nestedDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      const newDocRef = await addDoc(nestedSubPagesRef, {
        ...content,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const newDocRef2 = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        newDocRef.id
      );
      await setDoc(
        newDocRef2,
        {
          contentPath: `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${newDocRef.id}`,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "nested",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: newDocRef.id,
        topicId: null,
        quizId: null,
        refPath: `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${newDocRef.id}`,
      });

      return {
        success: true,
        message: `Nested sub-page created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Get current slug from document if not already retrieved
    if (currentSlug === null) {
      const existingDocSnap = await getDoc(nestedDocRef);
      if (existingDocSnap.exists()) {
        currentSlug = existingDocSnap.data()?.slug || null;
      }
    }
    const normalizedCurrentSlug = currentSlug
      ? currentSlug.toLowerCase().replace(/\s+/g, "-")
      : null;

    // Check if the new slug is different from the current slug
    if (normalizedCurrentSlug && normalizedNewSlug !== normalizedCurrentSlug) {
      // Slug is being changed, check if new slug is available
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    } else if (!normalizedCurrentSlug) {
      // Document exists but has no slug, check if new slug is available
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }
    }
    // If slug hasn't changed, no need to check availability

    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${nestedDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      nestedDocId
    );
    // Remove unnecessary fields: trustIndicators, whatToExpect, mostCommonQuestions, studyGuide, privacyPricing, faq
    const {
      trustIndicators: _trustIndicators,
      whatToExpect: _whatToExpect,
      mostCommonQuestions: _mostCommonQuestions,
      studyGuide: _studyGuide,
      privacyPricing: _privacyPricing,
      faq: _faq,
      ...cleanContent
    } = content;

    await setDoc(
      docRef,
      {
        ...cleanContent,
        slug: normalizedNewSlug,
        type: "nested",
        parentId: resolvedParentId,
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: cleanContent.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "nested",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: nestedDocId,
      topicId: null,
      quizId: null,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Nested sub-page updated successfully!`,
      data: { id: nestedDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page
export const deleteNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    const refPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}`;

    // Delete the document
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING ENTRANCE EXAM QUIZZES OPERATIONS ====================

// Get all quizzes under a nested sub-page (for entrance exam)
export const getNursingEntranceExamQuizzes = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // Now query quizzes using the resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes"
      )
    );
    const quizzes: any[] = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        quizId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: quizzes,
      message: "All quizzes retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quizzes:", error);
    return {
      success: false,
      message: `Failed to retrieve quizzes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: [],
    };
  }
};

// Get a specific quiz content (for entrance exam)
export const getNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Get all quizzes to search by slug using resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes"
      )
    );

    // First, try to find by slug (this is the primary method for frontend access)
    for (const doc of querySnapshot.docs) {
      const quizData = doc.data();
      const quizSlug = quizData.slug || "";

      // Check if the slug matches (case-insensitive)
      if (quizSlug.toLowerCase() === quizId.toLowerCase()) {
        return {
          success: true,
          data: {
            id: doc.id,
            quizId: doc.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully by slug!`,
        };
      }
    }

    // If not found by slug, try by document ID (for admin panel backward compatibility)
    // But only if the document ID matches AND there's no slug set (for old quizzes without slugs)
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      quizId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quizData = docSnap.data();
      const quizSlug = quizData.slug || "";

      // Allow document ID access if:
      // 1. There's no slug set (old quiz without slug), OR
      // 2. The document ID matches the slug (backward compatibility for quizzes where ID = slug), OR
      // 3. The document ID matches the quizId (allow access by document ID even if slug exists)
      if (
        !quizSlug ||
        quizSlug.toLowerCase() === quizId.toLowerCase() ||
        docSnap.id.toLowerCase() === quizId.toLowerCase()
      ) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            quizId: docSnap.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully!`,
        };
      }
      // If slug exists and doesn't match, and document ID doesn't match, don't return
    }

    // If still not found, return error
    return {
      success: false,
      message: `No quiz content found for ${quizId}`,
    };
  } catch (error) {
    console.error(`Error getting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update quiz content (for entrance exam) - uses auto-generated document IDs
export const uploadNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || quizId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;
    const normalizedOldSlug = quizId.toLowerCase().replace(/\s+/g, "-");

    // Find quiz by slug (or document ID for backward compatibility)
    let quizDocId: string | null = null;
    const quizzesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes"
    );
    const quizSlugQuery = query(
      quizzesRef,
      where("slug", "==", normalizedOldSlug)
    );
    const quizSlugSnapshot = await getDocs(quizSlugQuery);

    if (!quizSlugSnapshot.empty) {
      quizDocId = quizSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const quizDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        quizId
      );
      const quizDocSnap = await getDoc(quizDocRef);
      if (quizDocSnap.exists()) {
        quizDocId = quizDocSnap.id;
      }
    }

    if (!quizDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // nestedSubPageId should be the document ID of the parent nested sub-page (the page that contains this quiz)
      const newDocRef = await addDoc(quizzesRef, {
        ...content,
        slug: normalizedNewSlug,
        type: "quiz",
        parentId: resolvedParentId, // Document ID of the parent sub-page
        nestedSubPageId: resolvedNestedId, // Document ID of the parent nested sub-page (the page that contains this quiz)
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "quiz",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: resolvedNestedId,
        topicId: null,
        quizId: newDocRef.id,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Quiz created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // Check if the new slug is different and already exists (for another page)
    if (normalizedNewSlug !== normalizedOldSlug) {
      // First check if slug is in static routes
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // Then check route mappings
      const routeMappingCheck = await getRouteMappingBySlugOnly(
        normalizedNewSlug
      );
      if (routeMappingCheck.success && routeMappingCheck.data) {
        // Check if it's the same page (same refPath) - if so, allow the update
        const existingMapping = routeMappingCheck.data as any;
        const currentRefPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${quizDocId}`;
        if (existingMapping.refPath !== currentRefPath) {
          return {
            success: false,
            message: `A page with the slug "${normalizedNewSlug}" already exists. Please choose a different slug.`,
          };
        }
      }
    }

    // nestedSubPageId should be the document ID of the parent nested sub-page (the page that contains this quiz)
    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${quizDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      quizDocId
    );
    await setDoc(
      docRef,
      {
        ...content,
        slug: normalizedNewSlug, // Update slug field
        type: "quiz",
        parentId: resolvedParentId, // Document ID of the parent sub-page
        nestedSubPageId: resolvedNestedId, // Document ID of the parent nested sub-page (the page that contains this quiz)
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "quiz",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId: null,
      quizId: quizDocId,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Quiz updated successfully!`,
      data: { id: quizDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to upload quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete quiz (for entrance exam)
export const deleteNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // First, get the quiz to resolve the actual document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    if (!quizResult.success || !quizResult.data) {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    const quizData = quizResult.data as any;
    const actualQuizId = quizData.id || quizId;

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        resolvedParentId = parentSubPageId;
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        resolvedNestedId = nestedSubPageId;
      }
    }

    const refPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${actualQuizId}`;

    // Delete the document
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      quizId: actualQuizId,
    });

    return {
      success: true,
      message: `Quiz ${quizId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to delete quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK QUIZ QUESTIONS OPERATIONS ====================

// Get all questions under a quiz (for test bank)
export const getNursingTestBankQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
          data: [],
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingTestBankQuiz(
      resolvedParentId,
      resolvedNestedId,
      resolvedTopicId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
        data: [],
      };
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes",
        actualQuizId,
        "questions"
      )
    );
    const questions: any[] = [];

    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        questionId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question content (for test bank quiz)
export const getNursingTestBankQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string,
  questionId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve IDs (similar to getNursingTestBankQuizQuestions)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingTestBankQuiz(
      resolvedParentId,
      resolvedNestedId,
      resolvedTopicId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question ${questionId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question content found for ${questionId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question content (for test bank quiz)
export const uploadNursingTestBankQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string,
  questionId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Resolve topicId to actual document ID (it might be a slug)
    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingTestBankQuiz(
      resolvedParentId,
      resolvedNestedId,
      resolvedTopicId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question ${questionId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to upload question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete question (for test bank quiz)
export const deleteNursingTestBankQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string,
  questionId: string
) => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve IDs (similar to uploadNursingTestBankQuizQuestion)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    let resolvedNestedId: string | null = null;
    const normalizedNestedSlug = nestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", normalizedNestedSlug)
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    let resolvedTopicId: string | null = null;
    const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
    const topicsRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics"
    );
    const topicSlugQuery = query(
      topicsRef,
      where("slug", "==", normalizedTopicSlug)
    );
    const topicSlugSnapshot = await getDocs(topicSlugQuery);

    if (!topicSlugSnapshot.empty) {
      resolvedTopicId = topicSlugSnapshot.docs[0].id;
    } else {
      const topicDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        topicId
      );
      const topicDocSnap = await getDoc(topicDocRef);
      if (topicDocSnap.exists()) {
        resolvedTopicId = topicDocSnap.id;
      } else {
        return {
          success: false,
          message: `Topic ${topicId} not found`,
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingTestBankQuiz(
      resolvedParentId,
      resolvedNestedId,
      resolvedTopicId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "topics",
      resolvedTopicId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question ${questionId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to delete question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Bulk upload questions (for test bank quiz)
export const bulkUploadNursingTestBankQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string,
  questions: any[]
) => {
  console.log("=".repeat(80));
  console.log("[BULK UPLOAD DEBUG] ===== FUNCTION CALLED =====");
  console.log("=".repeat(80));
  try {
    console.log(`[BULK UPLOAD DEBUG] Starting bulk upload:`, {
      parentSubPageId,
      nestedSubPageId,
      topicId,
      quizId,
      questionsCount: questions.length,
    });

    // Step 1: Find the quiz document first (quizId might be a slug or document ID)
    let quizDoc: any = null;
    let actualQuizId: string | null = null;
    let resolvedParentId: string | null = null;
    let resolvedNestedId: string | null = null;
    let resolvedTopicId: string | null = null;
    let resolvedPillarId: string | null = null;

    const possiblePillars = ["nursing-test-bank"];

    console.log(
      `[BULK UPLOAD DEBUG] Searching for quiz "${quizId}" in pillar: ${possiblePillars[0]}`
    );

    for (const pillarId of possiblePillars) {
      console.log(`[BULK UPLOAD DEBUG] Searching in pillar: ${pillarId}`);
      const allSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages"
      );
      const allSubPagesSnapshot = await getDocs(allSubPagesRef);
      console.log(
        `[BULK UPLOAD DEBUG] Found ${allSubPagesSnapshot.docs.length} sub-pages in pillar ${pillarId}`
      );

      for (const subPageDoc of allSubPagesSnapshot.docs) {
        const subPageId = subPageDoc.id;
        console.log(`[BULK UPLOAD DEBUG] Checking sub-page: ${subPageId}`);
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId,
          "nestedSubPages"
        );
        const nestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);
        console.log(
          `[BULK UPLOAD DEBUG] Found ${nestedSubPagesSnapshot.docs.length} nested sub-pages under sub-page ${subPageId}`
        );

        for (const nestedSubPageDoc of nestedSubPagesSnapshot.docs) {
          const nestedSubPageId = nestedSubPageDoc.id;
          console.log(
            `[BULK UPLOAD DEBUG] Checking nested sub-page: ${nestedSubPageId}`
          );
          const topicsRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageId,
            "nestedSubPages",
            nestedSubPageId,
            "topics"
          );
          const topicsSnapshot = await getDocs(topicsRef);
          console.log(
            `[BULK UPLOAD DEBUG] Found ${topicsSnapshot.docs.length} topics under nested sub-page ${nestedSubPageId}`
          );

          for (const topicDoc of topicsSnapshot.docs) {
            const topicDocId = topicDoc.id;
            console.log(`[BULK UPLOAD DEBUG] Checking topic: ${topicDocId}`);
            const quizzesRef = collection(
              db,
              "pillarPages",
              pillarId,
              "subPages",
              subPageId,
              "nestedSubPages",
              nestedSubPageId,
              "topics",
              topicDocId,
              "quizzes"
            );
            const quizzesSnapshot = await getDocs(quizzesRef);
            console.log(
              `[BULK UPLOAD DEBUG] Found ${quizzesSnapshot.docs.length} quizzes under topic ${topicDocId}`
            );

            for (const quizDocSnap of quizzesSnapshot.docs) {
              const quizData = quizDocSnap.data();
              const quizDocId = quizDocSnap.id;
              const quizSlug = (quizData.slug || "").toLowerCase().trim();
              const searchQuizId = quizId.toLowerCase().trim();

              console.log(`[BULK UPLOAD DEBUG] Checking quiz:`, {
                quizDocId,
                quizSlug,
                searchQuizId,
                quizDataParentId: quizData.parentId,
                quizDataNestedSubPageId: quizData.nestedSubPageId,
                quizDataTopicId: quizData.topicId,
                quizDataPillarId: quizData.pillarId,
              });

              const matchesById =
                quizDocId === quizId || quizDocId === searchQuizId;
              const matchesBySlug =
                quizSlug === searchQuizId ||
                quizSlug === quizId.toLowerCase().replace(/\s+/g, "-");

              if (matchesById || matchesBySlug) {
                console.log(`[BULK UPLOAD DEBUG] ✓ MATCH FOUND!`, {
                  matchType: matchesById ? "ID" : "slug",
                  quizDocId,
                  quizSlug,
                });
                quizDoc = quizData;
                actualQuizId = quizDocId;
                resolvedParentId = quizData.parentId || subPageId;
                resolvedNestedId = quizData.nestedSubPageId || nestedSubPageId;
                resolvedTopicId = quizData.topicId || topicDocId;
                resolvedPillarId = quizData.pillarId || pillarId;
                break;
              }
            }
            if (quizDoc) break;
          }
          if (quizDoc) break;
        }
        if (quizDoc) break;
      }
      if (quizDoc) break;
    }

    if (
      !quizDoc ||
      !actualQuizId ||
      !resolvedParentId ||
      !resolvedNestedId ||
      !resolvedTopicId ||
      !resolvedPillarId
    ) {
      console.error(`[BULK UPLOAD DEBUG] ✗ Quiz not found!`, {
        quizDoc: !!quizDoc,
        actualQuizId,
        resolvedParentId,
        resolvedNestedId,
        resolvedTopicId,
        resolvedPillarId,
        searchedQuizId: quizId,
      });
      return {
        success: false,
        message: `Quiz "${quizId}" not found. Could not locate quiz document.`,
        data: { successful: [], failed: [] },
      };
    }

    console.log(`[BULK UPLOAD DEBUG] ✓ Quiz found! Using IDs:`, {
      quizId: actualQuizId,
      parentId: resolvedParentId,
      nestedSubPageId: resolvedNestedId,
      topicId: resolvedTopicId,
      pillarId: resolvedPillarId,
    });

    const results = [];
    const errors = [];

    console.log(
      `[BULK UPLOAD DEBUG] Starting to process ${questions.length} questions`
    );

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(
        `[BULK UPLOAD DEBUG] Processing question ${i + 1}/${questions.length}:`,
        {
          questionId: question.id,
          hasQuestion: !!question.question,
        }
      );
      try {
        let optionsArray: string[] = [];

        if (question.options) {
          try {
            const optionsString =
              typeof question.options === "string"
                ? question.options
                : JSON.stringify(question.options);
            const optionsObject = JSON.parse(optionsString);
            optionsArray = Object.keys(optionsObject)
              .sort()
              .map((key) => {
                const option = optionsObject[key];
                let optionText = "";
                if (
                  typeof option === "object" &&
                  option !== null &&
                  option.choice
                ) {
                  optionText = option.choice;
                } else if (typeof option === "string") {
                  optionText = option;
                } else if (option !== null && option !== undefined) {
                  optionText = String(option);
                }
                return optionText;
              });
          } catch {
            console.warn(
              `[BULK UPLOAD DEBUG] Failed to parse options for question ${
                i + 1
              }, using empty array`
            );
            optionsArray = [];
          }
        }

        const questionContent: any = {
          question: question.question || "",
          options: optionsArray,
          correctAnswer: question.correctAnswer || "",
          explanation: question.solution || question.explanation || "",
          questionTypeId:
            question.question_type_id || question.questionTypeId || 1,
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        };

        if (question.units) {
          questionContent.units = question.units;
        }

        const cleanQuestionText = (question.question || "")
          .replace(/<[^>]*>/g, "")
          .trim();
        const truncated = cleanQuestionText.substring(0, 180);
        const slug = truncated
          .toLowerCase()
          .replace(/nbsp/g, "")
          .replace(/&nbsp;/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        questionContent.slug = slug;

        const questionDocId =
          question.id?.toString().toLowerCase().replace(/\s+/g, "-") ||
          slug ||
          `question-${Date.now()}-${i}`;

        const docPath = `pillarPages/${resolvedPillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/topics/${resolvedTopicId}/quizzes/${actualQuizId}/questions/${questionDocId}`;
        console.log(
          `[BULK UPLOAD DEBUG] Saving question ${i + 1} to path: ${docPath}`
        );

        const docRef = doc(
          db,
          "pillarPages",
          resolvedPillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          resolvedNestedId,
          "topics",
          resolvedTopicId,
          "quizzes",
          actualQuizId,
          "questions",
          questionDocId
        );

        await setDoc(docRef, questionContent);

        console.log(
          `[BULK UPLOAD DEBUG] ✓ Question ${
            i + 1
          } saved successfully: ${questionDocId}`
        );
        results.push({
          questionId: questionDocId,
          originalId: question.id,
          success: true,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[BULK UPLOAD DEBUG] ✗ Question ${i + 1} error:`,
          errorMsg,
          error
        );
        errors.push({
          questionId: question.id?.toString() || "unknown",
          error: errorMsg,
        });
      }
    }

    console.log(`[BULK UPLOAD DEBUG] Upload complete:`, {
      successful: results.length,
      failed: errors.length,
      total: questions.length,
    });

    return {
      success: errors.length === 0,
      message: `Uploaded ${results.length} questions successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ""
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    };
  } catch (error) {
    console.error(`[BULK UPLOAD DEBUG] Fatal error:`, error);
    return {
      success: false,
      message: `Failed to upload questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: { successful: [], failed: [] },
    };
  }
};

// ==================== NURSING ENTRANCE EXAM QUIZ QUESTIONS OPERATIONS ====================

// Get all questions under a quiz (for entrance exam)
export const getNursingEntranceExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    // Pass original IDs/slugs, not resolved IDs, since getNursingEntranceExamQuiz does its own resolution
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    // The getNursingEntranceExamQuiz function now returns the document ID in the data
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
        data: [],
      };
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        actualQuizId,
        "questions"
      )
    );
    const questions: any[] = [];

    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        questionId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question content (for entrance exam quiz)
export const getNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    const pillarId = "nursing-entrance-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question ${questionId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question content found for ${questionId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question content (for entrance exam quiz)
export const uploadNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string,
  content: any
) => {
  try {
    // Step 1: Find the quiz document first (quizId might be a slug or document ID)
    // We need to search across all possible locations since we don't know the exact path yet
    let quizDoc: any = null;
    let actualQuizId: string | null = null;
    let resolvedParentId: string | null = null;
    let resolvedNestedId: string | null = null;
    let resolvedPillarId: string | null = null;

    // Try to find the quiz by searching in the nursing-entrance-exam pillar
    const pillarId = "nursing-entrance-exam";

    // First, try to find quiz by slug or ID in all possible locations
    // We'll search by getting all sub-pages, then all nested sub-pages, then all quizzes
    const allSubPagesRef = collection(db, "pillarPages", pillarId, "subPages");
    const allSubPagesSnapshot = await getDocs(allSubPagesRef);

    for (const subPageDoc of allSubPagesSnapshot.docs) {
      const subPageId = subPageDoc.id;
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        subPageId,
        "nestedSubPages"
      );
      const nestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);

      for (const nestedSubPageDoc of nestedSubPagesSnapshot.docs) {
        const nestedSubPageId = nestedSubPageDoc.id;
        const quizzesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId,
          "nestedSubPages",
          nestedSubPageId,
          "quizzes"
        );
        const quizzesSnapshot = await getDocs(quizzesRef);

        for (const quizDocSnap of quizzesSnapshot.docs) {
          const quizData = quizDocSnap.data();
          const quizDocId = quizDocSnap.id;
          const quizSlug = (quizData.slug || "").toLowerCase().trim();
          const searchQuizId = quizId.toLowerCase().trim();

          // Check if this is the quiz we're looking for (by ID or slug)
          if (
            quizDocId === quizId ||
            quizDocId === searchQuizId ||
            quizSlug === searchQuizId ||
            quizSlug === quizId.toLowerCase().replace(/\s+/g, "-")
          ) {
            quizDoc = quizData;
            actualQuizId = quizDocId;
            // Extract parentId and nestedSubPageId from the quiz document
            resolvedParentId = quizData.parentId || subPageId;
            resolvedNestedId = quizData.nestedSubPageId || nestedSubPageId;
            resolvedPillarId = quizData.pillarId || pillarId;
            break;
          }
        }
        if (quizDoc) break;
      }
      if (quizDoc) break;
    }

    // If quiz not found, return error
    if (!quizDoc || !actualQuizId || !resolvedParentId || !resolvedNestedId) {
      return {
        success: false,
        message: `Quiz "${quizId}" not found. Could not locate quiz document.`,
      };
    }

    console.log(`[DEBUG] Found quiz:`, {
      quizId: actualQuizId,
      parentId: resolvedParentId,
      nestedSubPageId: resolvedNestedId,
      pillarId: resolvedPillarId,
    });

    // Step 2: Use the IDs from the quiz document to construct the path
    if (
      !resolvedPillarId ||
      !resolvedParentId ||
      !resolvedNestedId ||
      !actualQuizId
    ) {
      return {
        success: false,
        message: `Failed to resolve required IDs. Pillar: ${resolvedPillarId}, Parent: ${resolvedParentId}, Nested: ${resolvedNestedId}, Quiz: ${actualQuizId}`,
      };
    }

    const docRef = doc(
      db,
      "pillarPages",
      resolvedPillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question ${questionId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to upload question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Bulk upload questions (for entrance exam quiz)
export const bulkUploadNursingEntranceExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questions: any[]
) => {
  console.log("=".repeat(80));
  console.log("[BULK UPLOAD DEBUG] ===== FUNCTION CALLED =====");
  console.log("=".repeat(80));
  try {
    console.log(`[BULK UPLOAD DEBUG] Starting bulk upload:`, {
      parentSubPageId,
      nestedSubPageId,
      quizId,
      questionsCount: questions.length,
    });

    // Step 1: Find the quiz document first (quizId might be a slug or document ID)
    // The quiz document contains parentId, nestedSubPageId, and pillarId fields
    let quizDoc: any = null;
    let actualQuizId: string | null = null;
    let resolvedParentId: string | null = null;
    let resolvedNestedId: string | null = null;
    let resolvedPillarId: string | null = null;

    // For nursing entrance exam, only search in the nursing-entrance-exam pillar
    const possiblePillars = ["nursing-entrance-exam"];

    console.log(
      `[BULK UPLOAD DEBUG] Searching for quiz "${quizId}" in pillar: ${possiblePillars[0]}`
    );

    for (const pillarId of possiblePillars) {
      console.log(`[BULK UPLOAD DEBUG] Searching in pillar: ${pillarId}`);
      const allSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages"
      );
      const allSubPagesSnapshot = await getDocs(allSubPagesRef);
      console.log(
        `[BULK UPLOAD DEBUG] Found ${allSubPagesSnapshot.docs.length} sub-pages in pillar ${pillarId}`
      );

      for (const subPageDoc of allSubPagesSnapshot.docs) {
        const subPageId = subPageDoc.id;
        console.log(`[BULK UPLOAD DEBUG] Checking sub-page: ${subPageId}`);
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId,
          "nestedSubPages"
        );
        const nestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);
        console.log(
          `[BULK UPLOAD DEBUG] Found ${nestedSubPagesSnapshot.docs.length} nested sub-pages under sub-page ${subPageId}`
        );

        for (const nestedSubPageDoc of nestedSubPagesSnapshot.docs) {
          const nestedSubPageId = nestedSubPageDoc.id;
          console.log(
            `[BULK UPLOAD DEBUG] Checking nested sub-page: ${nestedSubPageId}`
          );
          const quizzesRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageId,
            "nestedSubPages",
            nestedSubPageId,
            "quizzes"
          );
          const quizzesSnapshot = await getDocs(quizzesRef);
          console.log(
            `[BULK UPLOAD DEBUG] Found ${quizzesSnapshot.docs.length} quizzes under nested sub-page ${nestedSubPageId}`
          );

          for (const quizDocSnap of quizzesSnapshot.docs) {
            const quizData = quizDocSnap.data();
            const quizDocId = quizDocSnap.id;
            const quizSlug = (quizData.slug || "").toLowerCase().trim();
            const searchQuizId = quizId.toLowerCase().trim();

            console.log(`[BULK UPLOAD DEBUG] Checking quiz:`, {
              quizDocId,
              quizSlug,
              searchQuizId,
              quizDataParentId: quizData.parentId,
              quizDataNestedSubPageId: quizData.nestedSubPageId,
              quizDataPillarId: quizData.pillarId,
            });

            // Check if this is the quiz we're looking for (by ID or slug)
            const matchesById =
              quizDocId === quizId || quizDocId === searchQuizId;
            const matchesBySlug =
              quizSlug === searchQuizId ||
              quizSlug === quizId.toLowerCase().replace(/\s+/g, "-");

            if (matchesById || matchesBySlug) {
              console.log(`[BULK UPLOAD DEBUG] ✓ MATCH FOUND!`, {
                matchType: matchesById ? "ID" : "slug",
                quizDocId,
                quizSlug,
              });
              quizDoc = quizData;
              actualQuizId = quizDocId;
              // Extract parentId and nestedSubPageId from the quiz document
              resolvedParentId = quizData.parentId || subPageId;
              resolvedNestedId = quizData.nestedSubPageId || nestedSubPageId;
              resolvedPillarId = quizData.pillarId || pillarId;
              break;
            }
          }
          if (quizDoc) break;
        }
        if (quizDoc) break;
      }
      if (quizDoc) break;
    }

    // If quiz not found, return error
    if (
      !quizDoc ||
      !actualQuizId ||
      !resolvedParentId ||
      !resolvedNestedId ||
      !resolvedPillarId
    ) {
      console.error(`[BULK UPLOAD DEBUG] ✗ Quiz not found!`, {
        quizDoc: !!quizDoc,
        actualQuizId,
        resolvedParentId,
        resolvedNestedId,
        resolvedPillarId,
        searchedQuizId: quizId,
      });
      return {
        success: false,
        message: `Quiz "${quizId}" not found. Could not locate quiz document.`,
        data: { successful: [], failed: [] },
      };
    }

    console.log(`[BULK UPLOAD DEBUG] ✓ Quiz found! Using IDs:`, {
      quizId: actualQuizId,
      parentId: resolvedParentId,
      nestedSubPageId: resolvedNestedId,
      pillarId: resolvedPillarId,
    });

    const results = [];
    const errors = [];

    console.log(
      `[BULK UPLOAD DEBUG] Starting to process ${questions.length} questions`
    );

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(
        `[BULK UPLOAD DEBUG] Processing question ${i + 1}/${questions.length}:`,
        {
          questionId: question.id,
          hasQuestion: !!question.question,
        }
      );
      try {
        // Parse options - always treat as string and parse JSON
        let optionsArray: string[] = [];

        if (question.options) {
          try {
            // Convert to string if not already
            const optionsString =
              typeof question.options === "string"
                ? question.options
                : JSON.stringify(question.options);

            // Parse the JSON string
            const optionsObject = JSON.parse(optionsString);

            // Convert options object to array format
            optionsArray = Object.keys(optionsObject)
              .sort()
              .map((key) => {
                const option = optionsObject[key];
                let optionText = "";

                // Extract choice text, handling both object with choice property and direct string
                if (
                  typeof option === "object" &&
                  option !== null &&
                  option.choice
                ) {
                  optionText = String(option.choice).trim();
                } else if (typeof option === "string") {
                  optionText = option.trim();
                } else {
                  optionText = String(option || "").trim();
                }

                // Remove quotes from start and end if present (handle multiple quote types)
                // Keep removing quotes until no more quotes at start/end
                let cleaned = optionText;
                let changed = true;
                const quoteChars = [
                  '"',
                  "'",
                  "\u201C",
                  "\u201D",
                  "\u2018",
                  "\u2019",
                ]; // straight and curly quotes

                while (changed && cleaned.length >= 2) {
                  changed = false;
                  for (const quote of quoteChars) {
                    if (cleaned.startsWith(quote) && cleaned.endsWith(quote)) {
                      cleaned = cleaned.slice(1, -1).trim();
                      changed = true;
                      break; // Start over to check for nested quotes
                    }
                  }
                }

                return cleaned;
              });
          } catch (e) {
            console.error("Error parsing options:", e);
          }
        }

        // Helper function to strip HTML tags and generate slug
        const stripHtmlTags = (html: string): string => {
          if (!html) return "";
          return html.replace(/<[^>]*>/g, "").trim();
        };

        const generateSlug = (questionText: string): string => {
          if (!questionText) return "";
          const cleanText = stripHtmlTags(questionText);
          const truncated = cleanText.substring(0, 180);
          const slug = truncated
            .toLowerCase()
            .replace(/nbsp/g, "")
            .replace(/&nbsp;/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return slug;
        };

        // Handle correctAnswer based on question type
        const questionTypeId = question.question_type_id || 1;
        let correctAnswerToSave: any =
          question.correctAnswer || question.correct_answer || "";

        // For type 7 (numeric), ensure correctAnswer is an array, not a JSON string
        if (questionTypeId === 7) {
          if (typeof correctAnswerToSave === "string") {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(correctAnswerToSave);
              correctAnswerToSave = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // If not JSON, wrap in array
              correctAnswerToSave = [correctAnswerToSave];
            }
          } else if (!Array.isArray(correctAnswerToSave)) {
            // If it's not an array, wrap it
            correctAnswerToSave = [String(correctAnswerToSave)];
          }
        }

        // Create question content
        const questionContent = {
          question: question.question || "",
          options: optionsArray,
          correctAnswer: correctAnswerToSave,
          explanation: question.solution || question.explanation || "",
          questionTypeId: questionTypeId,
          slug: generateSlug(question.question || ""),
          originalId: question.id?.toString() || "",
          questionId:
            question.id?.toString() || question.questionId?.toString() || "",
          isCopyRight: question.isCopyRight || false,
          // Meta fields (editable after upload)
          meta: {
            title: "",
            description: "",
            keywords: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            canonicalUrl: "",
          },
          schema: "",
          status: "published",
          // Additional fields from original data
          tabs: question.tabs || null,
          matchOption: question.match_option || null,
          imagePath: question.image_path || null,
          units: question.units || null,
          subquestions: question.subquestions || [],
        };

        // Use question ID as the document ID, or generate one
        const questionDocId =
          question.id?.toString() ||
          `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Use the IDs from the quiz document to construct the path
        if (
          !resolvedPillarId ||
          !resolvedParentId ||
          !resolvedNestedId ||
          !actualQuizId
        ) {
          const errorMsg = `Failed to resolve required IDs. Pillar: ${resolvedPillarId}, Parent: ${resolvedParentId}, Nested: ${resolvedNestedId}, Quiz: ${actualQuizId}`;
          console.error(
            `[BULK UPLOAD DEBUG] ✗ Question ${i + 1} failed: ${errorMsg}`
          );
          errors.push({
            questionId: question.id?.toString() || "unknown",
            error: errorMsg,
          });
          continue;
        }

        const docPath = `pillarPages/${resolvedPillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${actualQuizId}/questions/${questionDocId}`;
        console.log(
          `[BULK UPLOAD DEBUG] Saving question ${i + 1} to path: ${docPath}`
        );

        const docRef = doc(
          db,
          "pillarPages",
          resolvedPillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          resolvedNestedId,
          "quizzes",
          actualQuizId,
          "questions",
          questionDocId
        );

        await setDoc(docRef, {
          ...questionContent,
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        });

        console.log(
          `[BULK UPLOAD DEBUG] ✓ Question ${
            i + 1
          } saved successfully: ${questionDocId}`
        );
        results.push({
          questionId: questionDocId,
          originalId: question.id,
          success: true,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[BULK UPLOAD DEBUG] ✗ Question ${i + 1} error:`,
          errorMsg,
          error
        );
        errors.push({
          questionId: question.id?.toString() || "unknown",
          error: errorMsg,
        });
      }
    }

    console.log(`[BULK UPLOAD DEBUG] Upload complete:`, {
      successful: results.length,
      failed: errors.length,
      total: questions.length,
    });

    return {
      success: errors.length === 0,
      message: `Uploaded ${results.length} questions successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ""
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    };
  } catch (error) {
    console.error("[BULK UPLOAD DEBUG] ✗ Fatal error in bulk upload:", error);
    return {
      success: false,
      message: `Failed to bulk upload questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: { successful: [], failed: [] },
    };
  }
};

// Delete question (for entrance exam quiz)
export const deleteNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question ${questionId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to delete question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING EXIT EXAM QUIZ OPERATIONS ====================

// Get all quizzes under a nested sub-page (for exit exam)
export const getNursingExitExamQuizzes = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // Now query quizzes using the resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes"
      )
    );
    const quizzes: any[] = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        quizId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: quizzes,
      message: "All quizzes retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quizzes:", error);
    return {
      success: false,
      message: `Failed to retrieve quizzes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: [],
    };
  }
};

// Get a specific quiz content (for exit exam)
export const getNursingExitExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Get all quizzes to search by slug using resolved document IDs
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes"
      )
    );

    // First, try to find by slug (this is the primary method for frontend access)
    for (const doc of querySnapshot.docs) {
      const quizData = doc.data();
      const quizSlug = quizData.slug || "";

      // Check if the slug matches (case-insensitive)
      if (quizSlug.toLowerCase() === quizId.toLowerCase()) {
        return {
          success: true,
          data: {
            id: doc.id,
            quizId: doc.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully by slug!`,
        };
      }
    }

    // If not found by slug, try by document ID (for admin panel backward compatibility)
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      quizId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quizData = docSnap.data();
      const quizSlug = quizData.slug || "";

      // Allow document ID access if:
      // 1. There's no slug set (old quiz without slug), OR
      // 2. The document ID matches the slug (backward compatibility for quizzes where ID = slug), OR
      // 3. The document ID matches the quizId (allow access by document ID even if slug exists)
      if (
        !quizSlug ||
        quizSlug.toLowerCase() === quizId.toLowerCase() ||
        docSnap.id.toLowerCase() === quizId.toLowerCase()
      ) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            quizId: docSnap.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully!`,
        };
      }
      // If slug exists and doesn't match, and document ID doesn't match, don't return
    }

    // If still not found, return error
    return {
      success: false,
      message: `No quiz content found for ${quizId}`,
    };
  } catch (error) {
    console.error(`Error getting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update quiz content (for exit exam) - uses auto-generated document IDs
export const uploadNursingExitExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  content: any
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    // let parentSlug: string = "";
    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
      // const parentData = parentSlugSnapshot.docs[0].data();
      // parentSlug = (parentData.slug || parentSubPageId)
      //   .toLowerCase()
      //   .replace(/\s+/g, "-");
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
        // const parentData = parentDocSnap.data();
        // parentSlug = (parentData.slug || parentSubPageId)
        //   .toLowerCase()
        //   .replace(/\s+/g, "-");
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
        };
      }
    }

    // Get user-provided slug (no prefix)
    const userSlug = content.slug?.trim() || quizId;
    const normalizedUserSlug = userSlug.toLowerCase().replace(/\s+/g, "-");
    const normalizedNewSlug = normalizedUserSlug;
    const normalizedOldSlug = quizId.toLowerCase().replace(/\s+/g, "-");

    // Find quiz by slug (or document ID for backward compatibility)
    let quizDocId: string | null = null;
    const quizzesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes"
    );
    const quizSlugQuery = query(
      quizzesRef,
      where("slug", "==", normalizedOldSlug)
    );
    const quizSlugSnapshot = await getDocs(quizSlugQuery);

    if (!quizSlugSnapshot.empty) {
      quizDocId = quizSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const quizDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        quizId
      );
      const quizDocSnap = await getDoc(quizDocRef);
      if (quizDocSnap.exists()) {
        quizDocId = quizDocSnap.id;
      }
    }

    if (!quizDocId) {
      // Document doesn't exist, create new one with auto-generated ID
      // Check if slug is available (not in route mappings or static routes)
      const slugCheck = await isSlugAvailable(normalizedNewSlug);
      if (!slugCheck.available) {
        return {
          success: false,
          message:
            slugCheck.message ||
            `The slug "${normalizedNewSlug}" is not available. Please choose a different slug.`,
        };
      }

      // nestedSubPageId should be the document ID of the parent nested sub-page (the page that contains this quiz)
      const newDocRef = await addDoc(quizzesRef, {
        ...content,
        slug: normalizedNewSlug,
        type: "quiz",
        parentId: resolvedParentId, // Document ID of the parent sub-page
        nestedSubPageId: resolvedNestedId, // Document ID of the parent nested sub-page (the page that contains this quiz)
        pillarId: pillarId,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      });

      // Update contentPath with the actual document ID
      const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${newDocRef.id}`;
      const docRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        newDocRef.id
      );
      await setDoc(
        docRef,
        {
          contentPath: contentPath,
        },
        { merge: true }
      );

      // Create route mapping
      await createRouteMapping({
        type: "quiz",
        pillarId: pillarId,
        slug: normalizedNewSlug,
        subPageId: resolvedParentId,
        nestedPageId: resolvedNestedId,
        topicId: null,
        quizId: newDocRef.id,
        refPath: contentPath,
      });

      return {
        success: true,
        message: `Quiz created successfully!`,
        data: { id: newDocRef.id, slug: normalizedNewSlug },
      };
    }

    // Document exists, update it (document ID stays the same, only slug field updates)
    // nestedSubPageId should be the document ID of the parent nested sub-page (the page that contains this quiz)
    const contentPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${quizDocId}`;
    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      quizDocId
    );
    await setDoc(
      docRef,
      {
        ...content,
        slug: normalizedNewSlug, // Update slug field
        type: "quiz",
        parentId: resolvedParentId, // Document ID of the parent sub-page
        nestedSubPageId: resolvedNestedId, // Document ID of the parent nested sub-page (the page that contains this quiz)
        pillarId: pillarId,
        contentPath: contentPath,
        lastUpdated: new Date().toISOString(),
        version: content.version || "1.0",
      },
      { merge: true }
    );

    // Update route mapping
    await createRouteMapping({
      type: "quiz",
      pillarId: pillarId,
      slug: normalizedNewSlug,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      topicId: null,
      quizId: quizDocId,
      refPath: contentPath,
    });

    return {
      success: true,
      message: `Quiz updated successfully!`,
      data: { id: quizDocId, slug: normalizedNewSlug },
    };
  } catch (error) {
    console.error(`Error uploading quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to upload quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete quiz (for exit exam)
export const deleteNursingExitExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // First, get the quiz to resolve the actual document ID
    const quizResult = await getNursingExitExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    if (!quizResult.success || !quizResult.data) {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    const quizData = quizResult.data as any;
    const actualQuizId = quizData.id || quizId;

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        resolvedParentId = parentSubPageId;
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        resolvedNestedId = nestedSubPageId;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId
    );
    await deleteDoc(docRef);

    // Delete route mapping
    const refPath = `pillarPages/${pillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${actualQuizId}`;
    await deleteRouteMappingByRefPath(refPath);
    // Also delete by IDs in case refPath doesn't match
    await deleteRouteMappingByIds({
      pillarId,
      subPageId: resolvedParentId,
      nestedPageId: resolvedNestedId,
      quizId: actualQuizId,
    });

    return {
      success: true,
      message: `Quiz ${quizId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to delete quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING EXIT EXAM QUIZ QUESTIONS OPERATIONS ====================

// Get all questions under a quiz (for exit exam)
export const getNursingExitExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        return {
          success: false,
          message: `Parent sub-page ${parentSubPageId} not found`,
          data: [],
        };
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        return {
          success: false,
          message: `Nested sub-page ${nestedSubPageId} not found`,
          data: [],
        };
      }
    }

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingExitExamQuiz(
      resolvedParentId,
      resolvedNestedId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
        data: [],
      };
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        actualQuizId,
        "questions"
      )
    );
    const questions: any[] = [];

    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        questionId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question content (for exit exam quiz)
export const getNursingExitExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingExitExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question ${questionId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question content found for ${questionId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question content (for exit exam quiz)
export const uploadNursingExitExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string,
  content: any
) => {
  try {
    // Step 1: Find the quiz document first (quizId might be a slug or document ID)
    // We need to search across all possible locations since we don't know the exact path yet
    let quizDoc: any = null;
    let actualQuizId: string | null = null;
    let resolvedParentId: string | null = null;
    let resolvedNestedId: string | null = null;
    let resolvedPillarId: string | null = null;

    // Try to find the quiz by searching in the nursing-exit-exam pillar
    const pillarId = "nursing-exit-exam";

    // First, try to find quiz by slug or ID in all possible locations
    // We'll search by getting all sub-pages, then all nested sub-pages, then all quizzes
    const allSubPagesRef = collection(db, "pillarPages", pillarId, "subPages");
    const allSubPagesSnapshot = await getDocs(allSubPagesRef);

    for (const subPageDoc of allSubPagesSnapshot.docs) {
      const subPageId = subPageDoc.id;
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        subPageId,
        "nestedSubPages"
      );
      const nestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);

      for (const nestedSubPageDoc of nestedSubPagesSnapshot.docs) {
        const nestedSubPageId = nestedSubPageDoc.id;
        const quizzesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId,
          "nestedSubPages",
          nestedSubPageId,
          "quizzes"
        );
        const quizzesSnapshot = await getDocs(quizzesRef);

        for (const quizDocSnap of quizzesSnapshot.docs) {
          const quizData = quizDocSnap.data();
          const quizDocId = quizDocSnap.id;
          const quizSlug = (quizData.slug || "").toLowerCase().trim();
          const searchQuizId = quizId.toLowerCase().trim();

          // Check if this is the quiz we're looking for (by ID or slug)
          if (
            quizDocId === quizId ||
            quizDocId === searchQuizId ||
            quizSlug === searchQuizId ||
            quizSlug === quizId.toLowerCase().replace(/\s+/g, "-")
          ) {
            quizDoc = quizData;
            actualQuizId = quizDocId;
            // Extract parentId and nestedSubPageId from the quiz document
            resolvedParentId = quizData.parentId || subPageId;
            resolvedNestedId = quizData.nestedSubPageId || nestedSubPageId;
            resolvedPillarId = quizData.pillarId || pillarId;
            break;
          }
        }
        if (quizDoc) break;
      }
      if (quizDoc) break;
    }

    // If quiz not found, return error
    if (!quizDoc || !actualQuizId || !resolvedParentId || !resolvedNestedId) {
      return {
        success: false,
        message: `Quiz "${quizId}" not found. Could not locate quiz document.`,
      };
    }

    console.log(`[DEBUG] Found quiz:`, {
      quizId: actualQuizId,
      parentId: resolvedParentId,
      nestedSubPageId: resolvedNestedId,
      pillarId: resolvedPillarId,
    });

    // Step 2: Use the IDs from the quiz document to construct the path
    if (
      !resolvedPillarId ||
      !resolvedParentId ||
      !resolvedNestedId ||
      !actualQuizId
    ) {
      return {
        success: false,
        message: `Failed to resolve required IDs. Pillar: ${resolvedPillarId}, Parent: ${resolvedParentId}, Nested: ${resolvedNestedId}, Quiz: ${actualQuizId}`,
      };
    }

    const docRef = doc(
      db,
      "pillarPages",
      resolvedPillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question ${questionId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to upload question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Bulk upload questions (for exit exam quiz)
export const bulkUploadNursingExitExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questions: any[]
) => {
  console.log("=".repeat(80));
  console.log("[BULK UPLOAD DEBUG] ===== FUNCTION CALLED =====");
  console.log("=".repeat(80));
  try {
    console.log(`[BULK UPLOAD DEBUG] Starting bulk upload:`, {
      parentSubPageId,
      nestedSubPageId,
      quizId,
      questionsCount: questions.length,
    });

    // Step 1: Find the quiz document first (quizId might be a slug or document ID)
    // The quiz document contains parentId, nestedSubPageId, and pillarId fields
    let quizDoc: any = null;
    let actualQuizId: string | null = null;
    let resolvedParentId: string | null = null;
    let resolvedNestedId: string | null = null;
    let resolvedPillarId: string | null = null;

    // For nursing exit exam, only search in the nursing-exit-exam pillar
    const possiblePillars = ["nursing-exit-exam"];

    console.log(
      `[BULK UPLOAD DEBUG] Searching for quiz "${quizId}" in pillar: ${possiblePillars[0]}`
    );

    for (const pillarId of possiblePillars) {
      console.log(`[BULK UPLOAD DEBUG] Searching in pillar: ${pillarId}`);
      const allSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages"
      );
      const allSubPagesSnapshot = await getDocs(allSubPagesRef);
      console.log(
        `[BULK UPLOAD DEBUG] Found ${allSubPagesSnapshot.docs.length} sub-pages in pillar ${pillarId}`
      );

      for (const subPageDoc of allSubPagesSnapshot.docs) {
        const subPageId = subPageDoc.id;
        console.log(`[BULK UPLOAD DEBUG] Checking sub-page: ${subPageId}`);
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId,
          "nestedSubPages"
        );
        const nestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);
        console.log(
          `[BULK UPLOAD DEBUG] Found ${nestedSubPagesSnapshot.docs.length} nested sub-pages under sub-page ${subPageId}`
        );

        for (const nestedSubPageDoc of nestedSubPagesSnapshot.docs) {
          const nestedSubPageId = nestedSubPageDoc.id;
          console.log(
            `[BULK UPLOAD DEBUG] Checking nested sub-page: ${nestedSubPageId}`
          );
          const quizzesRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageId,
            "nestedSubPages",
            nestedSubPageId,
            "quizzes"
          );
          const quizzesSnapshot = await getDocs(quizzesRef);
          console.log(
            `[BULK UPLOAD DEBUG] Found ${quizzesSnapshot.docs.length} quizzes under nested sub-page ${nestedSubPageId}`
          );

          for (const quizDocSnap of quizzesSnapshot.docs) {
            const quizData = quizDocSnap.data();
            const quizDocId = quizDocSnap.id;
            const quizSlug = (quizData.slug || "").toLowerCase().trim();
            const searchQuizId = quizId.toLowerCase().trim();

            console.log(`[BULK UPLOAD DEBUG] Checking quiz:`, {
              quizDocId,
              quizSlug,
              searchQuizId,
              quizDataParentId: quizData.parentId,
              quizDataNestedSubPageId: quizData.nestedSubPageId,
              quizDataPillarId: quizData.pillarId,
            });

            // Check if this is the quiz we're looking for (by ID or slug)
            const matchesById =
              quizDocId === quizId || quizDocId === searchQuizId;
            const matchesBySlug =
              quizSlug === searchQuizId ||
              quizSlug === quizId.toLowerCase().replace(/\s+/g, "-");

            if (matchesById || matchesBySlug) {
              console.log(`[BULK UPLOAD DEBUG] ✓ MATCH FOUND!`, {
                matchType: matchesById ? "ID" : "slug",
                quizDocId,
                quizSlug,
              });
              quizDoc = quizData;
              actualQuizId = quizDocId;
              // Extract parentId and nestedSubPageId from the quiz document
              resolvedParentId = quizData.parentId || subPageId;
              resolvedNestedId = quizData.nestedSubPageId || nestedSubPageId;
              resolvedPillarId = quizData.pillarId || pillarId;
              break;
            }
          }
          if (quizDoc) break;
        }
        if (quizDoc) break;
      }
      if (quizDoc) break;
    }

    // If quiz not found, return error
    if (
      !quizDoc ||
      !actualQuizId ||
      !resolvedParentId ||
      !resolvedNestedId ||
      !resolvedPillarId
    ) {
      console.error(`[BULK UPLOAD DEBUG] ✗ Quiz not found!`, {
        quizDoc: !!quizDoc,
        actualQuizId,
        resolvedParentId,
        resolvedNestedId,
        resolvedPillarId,
        searchedQuizId: quizId,
      });
      return {
        success: false,
        message: `Quiz "${quizId}" not found. Could not locate quiz document.`,
        data: { successful: [], failed: [] },
      };
    }

    console.log(`[BULK UPLOAD DEBUG] ✓ Quiz found! Using IDs:`, {
      quizId: actualQuizId,
      parentId: resolvedParentId,
      nestedSubPageId: resolvedNestedId,
      pillarId: resolvedPillarId,
    });

    const results = [];
    const errors = [];

    console.log(
      `[BULK UPLOAD DEBUG] Starting to process ${questions.length} questions`
    );

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(
        `[BULK UPLOAD DEBUG] Processing question ${i + 1}/${questions.length}:`,
        {
          questionId: question.id,
          hasQuestion: !!question.question,
        }
      );
      try {
        // Parse options - always treat as string and parse JSON
        let optionsArray: string[] = [];

        if (question.options) {
          try {
            // Convert to string if not already
            const optionsString =
              typeof question.options === "string"
                ? question.options
                : JSON.stringify(question.options);

            // Parse the JSON string
            const optionsObject = JSON.parse(optionsString);

            // Convert options object to array format
            optionsArray = Object.keys(optionsObject)
              .sort()
              .map((key) => {
                const option = optionsObject[key];
                let optionText = "";

                // Extract choice text, handling both object with choice property and direct string
                if (
                  typeof option === "object" &&
                  option !== null &&
                  option.choice
                ) {
                  optionText = String(option.choice).trim();
                } else if (typeof option === "string") {
                  optionText = option.trim();
                } else {
                  optionText = String(option || "").trim();
                }

                // Remove quotes from start and end if present (handle multiple quote types)
                let cleaned = optionText;
                let changed = true;
                const quoteChars = [
                  '"',
                  "'",
                  "\u201C",
                  "\u201D",
                  "\u2018",
                  "\u2019",
                ]; // straight and curly quotes

                while (changed && cleaned.length >= 2) {
                  changed = false;
                  for (const quote of quoteChars) {
                    if (cleaned.startsWith(quote) && cleaned.endsWith(quote)) {
                      cleaned = cleaned.slice(1, -1).trim();
                      changed = true;
                      break;
                    }
                  }
                }

                return cleaned;
              });
          } catch (e) {
            console.error("Error parsing options:", e);
          }
        }

        // Helper function to strip HTML tags and generate slug
        const stripHtmlTags = (html: string): string => {
          if (!html) return "";
          return html.replace(/<[^>]*>/g, "").trim();
        };

        const generateSlug = (questionText: string): string => {
          if (!questionText) return "";
          const cleanText = stripHtmlTags(questionText);
          const truncated = cleanText.substring(0, 180);
          const slug = truncated
            .toLowerCase()
            .replace(/nbsp/g, "")
            .replace(/&nbsp;/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return slug;
        };

        // Handle correctAnswer based on question type
        const questionTypeId = question.question_type_id || 1;
        let correctAnswerToSave: any =
          question.correctAnswer || question.correct_answer || "";

        // For type 7 (numeric), ensure correctAnswer is an array, not a JSON string
        if (questionTypeId === 7) {
          if (typeof correctAnswerToSave === "string") {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(correctAnswerToSave);
              correctAnswerToSave = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // If not JSON, wrap in array
              correctAnswerToSave = [correctAnswerToSave];
            }
          } else if (!Array.isArray(correctAnswerToSave)) {
            // If it's not an array, wrap it
            correctAnswerToSave = [String(correctAnswerToSave)];
          }
        }

        // Create question content
        const questionContent = {
          question: question.question || "",
          options: optionsArray,
          correctAnswer: correctAnswerToSave,
          explanation: question.solution || question.explanation || "",
          questionTypeId: questionTypeId,
          slug: generateSlug(question.question || ""),
          originalId: question.id?.toString() || "",
          questionId:
            question.id?.toString() || question.questionId?.toString() || "",
          // Meta fields (editable after upload)
          meta: {
            title: "",
            description: "",
            keywords: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            canonicalUrl: "",
          },
          schema: "",
          status: "published",
          // Additional fields from original data
          tabs: question.tabs || null,
          matchOption: question.match_option || null,
          imagePath: question.image_path || null,
          units: question.units || null,
          subquestions: question.subquestions || [],
        };

        // Use question ID as the document ID, or generate one
        const questionDocId =
          question.id?.toString() ||
          `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Use the IDs from the quiz document to construct the path
        if (
          !resolvedPillarId ||
          !resolvedParentId ||
          !resolvedNestedId ||
          !actualQuizId
        ) {
          const errorMsg = `Failed to resolve required IDs. Pillar: ${resolvedPillarId}, Parent: ${resolvedParentId}, Nested: ${resolvedNestedId}, Quiz: ${actualQuizId}`;
          console.error(
            `[BULK UPLOAD DEBUG] ✗ Question ${i + 1} failed: ${errorMsg}`
          );
          errors.push({
            questionId: question.id?.toString() || "unknown",
            error: errorMsg,
          });
          continue;
        }

        const docPath = `pillarPages/${resolvedPillarId}/subPages/${resolvedParentId}/nestedSubPages/${resolvedNestedId}/quizzes/${actualQuizId}/questions/${questionDocId}`;
        console.log(
          `[BULK UPLOAD DEBUG] Saving question ${i + 1} to path: ${docPath}`
        );

        const docRef = doc(
          db,
          "pillarPages",
          resolvedPillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          resolvedNestedId,
          "quizzes",
          actualQuizId,
          "questions",
          questionDocId
        );

        await setDoc(docRef, {
          ...questionContent,
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        });

        console.log(
          `[BULK UPLOAD DEBUG] ✓ Question ${
            i + 1
          } saved successfully: ${questionDocId}`
        );
        results.push({
          questionId: questionDocId,
          originalId: question.id,
          success: true,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[BULK UPLOAD DEBUG] ✗ Question ${i + 1} error:`,
          errorMsg,
          error
        );
        errors.push({
          questionId: question.id?.toString() || "unknown",
          error: errorMsg,
        });
      }
    }

    console.log(`[BULK UPLOAD DEBUG] Upload complete:`, {
      successful: results.length,
      failed: errors.length,
      total: questions.length,
    });

    return {
      success: errors.length === 0,
      message: `Uploaded ${results.length} questions successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ""
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    };
  } catch (error) {
    console.error("[BULK UPLOAD DEBUG] ✗ Fatal error in bulk upload:", error);
    return {
      success: false,
      message: `Failed to bulk upload questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: { successful: [], failed: [] },
    };
  }
};

// Delete question (for exit exam quiz)
export const deleteNursingExitExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    const pillarId = "nursing-exit-exam";

    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingExitExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    } else {
      return {
        success: false,
        message: `Quiz ${quizId} not found`,
      };
    }

    // Resolve parentSubPageId to actual document ID (it might be a slug)
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", parentSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);

    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        parentSubPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      } else {
        resolvedParentId = parentSubPageId;
      }
    }

    // Resolve nestedSubPageId to actual document ID (it might be a slug)
    let resolvedNestedId: string | null = null;
    const nestedSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages"
    );
    const nestedSlugQuery = query(
      nestedSubPagesRef,
      where("slug", "==", nestedSubPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const nestedSlugSnapshot = await getDocs(nestedSlugQuery);

    if (!nestedSlugSnapshot.empty) {
      resolvedNestedId = nestedSlugSnapshot.docs[0].id;
    } else {
      // Fallback: try by document ID
      const nestedDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        nestedSubPageId
      );
      const nestedDocSnap = await getDoc(nestedDocRef);
      if (nestedDocSnap.exists()) {
        resolvedNestedId = nestedDocSnap.id;
      } else {
        resolvedNestedId = nestedSubPageId;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      pillarId,
      "subPages",
      resolvedParentId,
      "nestedSubPages",
      resolvedNestedId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question ${questionId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to delete question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Image Upload Functions
export const uploadImage = async (
  file: File,
  folder: string = "blog-images"
) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      data: {
        url: downloadURL,
        path: fileName,
      },
      message: "Image uploaded successfully!",
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      message: `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const deleteImage = async (imagePath: string) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);

    return {
      success: true,
      message: "Image deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: `Failed to delete image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// =====================
// Question Operations
// =====================

// Upload or update a question
export const uploadQuestionContent = async (
  serviceId: string,
  slug: string,
  content: any
) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    await setDoc(docRef, {
      ...content,
      serviceId,
      slug,
      lastUpdated: new Date().toISOString(),
      createdAt: content.createdAt || new Date().toISOString(),
      version: "1.0",
    });
    return {
      success: true,
      message: "Question uploaded successfully!",
    };
  } catch (error) {
    console.error("Error uploading question content:", error);
    return {
      success: false,
      message: `Failed to upload question: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a single question by serviceId and slug
export const getQuestionContent = async (serviceId: string, slug: string) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question found for ${serviceId}/${slug}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question content:`, error);
    return {
      success: false,
      message: `Failed to retrieve question content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get question content by category and slug
export const getQuestionContentByCategory = async (
  category: string,
  slug: string
): Promise<{
  success: boolean;
  data?: any;
  message: string;
}> => {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    let questionData = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category === category && data.slug === slug) {
        questionData = data;
      }
    });

    if (questionData) {
      return {
        success: true,
        data: questionData,
        message: `Question content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question found for ${category}/${slug}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question content by category:`, error);
    return {
      success: false,
      message: `Failed to retrieve question content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all questions, optionally filtered by serviceId
export const getAllQuestions = async (serviceId?: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    const questions: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!serviceId || data.serviceId === serviceId) {
        questions.push({ id: doc.id, ...data });
      }
    });
    // Optionally sort by createdAt or lastUpdated
    questions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete a question
export const deleteQuestionContent = async (
  serviceId: string,
  slug: string
) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    await deleteDoc(docRef);
    return {
      success: true,
      message: `Question deleted successfully!`,
    };
  } catch (error) {
    console.error("Error deleting question:", error);
    return {
      success: false,
      message: `Failed to delete question: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== QUESTION TYPES OPERATIONS ====================

// Get all question types
export const getAllQuestionTypes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "questionTypes"));
    const questionTypes: any[] = [];

    querySnapshot.forEach((doc) => {
      questionTypes.push({
        id: doc.id,
        questionTypeId: doc.id,
        ...doc.data(),
      });
    });

    // Sort by questionTypeId
    questionTypes.sort((a, b) => {
      const idA = parseInt(a.questionTypeId) || 0;
      const idB = parseInt(b.questionTypeId) || 0;
      return idA - idB;
    });

    return {
      success: true,
      data: questionTypes,
      message: "All question types retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting question types:", error);
    return {
      success: false,
      message: `Failed to retrieve question types: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question type
export const getQuestionType = async (questionTypeId: string) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question type ${questionTypeId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question type found for ${questionTypeId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question type
export const uploadQuestionType = async (
  questionTypeId: string,
  content: any
) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    await setDoc(docRef, {
      ...content,
      questionTypeId,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question type ${questionTypeId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to upload question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete question type
export const deleteQuestionType = async (questionTypeId: string) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question type ${questionTypeId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to delete question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Seed question types (initial data)
export const seedQuestionTypes = async () => {
  const questionTypes = [
    {
      questionTypeId: "1",
      questionId: 1,
      contentDescription:
        "Standard multiple-choice question with a single correct option and rationales.",
      questionTypeName: "Single-Select Multiple Choice",
    },
    {
      questionTypeId: "2",
      questionId: 2,
      contentDescription:
        'Multiple-choice question where the user selects more than one correct option (e.g., "Select all that apply") and rationales.',
      questionTypeName: "Multiple-Select / Select All That Apply (SATA)",
    },
    {
      questionTypeId: "3",
      questionId: 3,
      contentDescription: "A statement that requires a True or False answer.",
      questionTypeName: "True/False",
    },
    {
      questionTypeId: "5",
      questionId: 5,
      contentDescription:
        "Requires matching items from an options list to corresponding explanations/descriptions. The structure includes match_option.",
      questionTypeName: "Matching (List to Explanation)",
    },
    {
      questionTypeId: "6",
      questionId: 6,
      contentDescription:
        "Requires putting a series of steps (medication administration order) into the correct sequence.",
      questionTypeName: "Ordering / Sequencing",
    },
    {
      questionTypeId: "7",
      questionId: 7,
      contentDescription:
        "A calculation problem (dosage calculation) requiring a numerical answer to be rounded.",
      questionTypeName: "Calculation / Fill-in-the-Blank (Numeric)",
    },
    {
      questionTypeId: "9",
      questionId: 9,
      contentDescription:
        "Requires the user to click a specific location on an image to select the answer (xRanges and yRanges coordinates).",
      questionTypeName: "Hot Spot / Image-Based Selection",
    },
    {
      questionTypeId: "10",
      questionId: 10,
      contentDescription:
        'Requires classifying multiple interventions as either "Indicated" or "Not Indicated" based on client data (Exhibit/Tabs format).',
      questionTypeName: "Classification / Indicated vs. Not Indicated",
    },
    {
      questionTypeId: "11",
      questionId: 11,
      contentDescription:
        "Requires the user to click on specific text-based findings to highlight the correct answers.",
      questionTypeName: "Highlight / Text-Based Selection",
    },
    {
      questionTypeId: "12",
      questionId: 12,
      contentDescription:
        "Requires dragging/selecting multiple choices to complete a diagram, assigning condition, actions, and monitoring parameters.",
      questionTypeName: "Drag-and-Drop / Complete the Diagram",
    },
    {
      questionTypeId: "13",
      questionId: 13,
      contentDescription:
        "Requires selecting options from dropdown lists to complete a sentence based on the clinical data.",
      questionTypeName: "Dropdown / Cloze",
    },
    {
      questionTypeId: "14",
      questionId: 14,
      contentDescription:
        "Requires classifying multiple findings against two different disease processes (Preeclampsia vs. HELLP Syndrome).",
      questionTypeName: "Matrix / Classification (Multiple Columns)",
    },
  ];

  try {
    const results = [];
    for (const questionType of questionTypes) {
      const result = await uploadQuestionType(
        questionType.questionTypeId,
        questionType
      );
      results.push({
        questionTypeId: questionType.questionTypeId,
        success: result.success,
        message: result.message,
      });
    }

    return {
      success: true,
      data: results,
      message: "Question types seeded successfully!",
    };
  } catch (error) {
    console.error("Error seeding question types:", error);
    return {
      success: false,
      message: `Failed to seed question types: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all question categories
export const getAllQuestionCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "questionCategories"));
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      data: categories,
      message: "All question categories retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting question categories:", error);
    return {
      success: false,
      message: `Failed to retrieve question categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new question category
export const addQuestionCategory = async (categoryName: string) => {
  try {
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "questionCategories", categoryId);
    await setDoc(docRef, {
      name: categoryName,
      slug: categoryId,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: `Category "${categoryName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding question category:`, error);
    return {
      success: false,
      message: `Failed to add question category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all services (HESI, TEAS, etc.)
export const getAllServicesList = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    const services: any[] = [];
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      data: services,
      message: "All services retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting services:", error);
    return {
      success: false,
      message: `Failed to retrieve services: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new service
export const addService = async (serviceName: string) => {
  try {
    const serviceId = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "services", serviceId);
    await setDoc(docRef, {
      name: serviceName,
      slug: serviceId,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: `Service "${serviceName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding service:`, error);
    return {
      success: false,
      message: `Failed to add service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get service by ID
export const getServiceById = async (serviceId: string) => {
  try {
    const docRef = doc(db, "services", serviceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
        message: "Service retrieved successfully!",
      };
    } else {
      return {
        success: false,
        message: `No service found with ID: ${serviceId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting service:`, error);
    return {
      success: false,
      message: `Failed to retrieve service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Initialize default services (HESI and TEAS)
export const initializeDefaultServices = async () => {
  try {
    const defaultServices = [
      { name: "HESI", slug: "hesi" },
      { name: "TEAS", slug: "teas" },
    ];

    for (const service of defaultServices) {
      const docRef = doc(db, "services", service.slug);
      await setDoc(docRef, {
        name: service.name,
        slug: service.slug,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: "Default services (HESI and TEAS) initialized successfully!",
    };
  } catch (error) {
    console.error("Error initializing default services:", error);
    return {
      success: false,
      message: `Failed to initialize default services: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== UNIVERSAL PAGE LOADER BY SLUG ====================

// Load any page by slug using type, parentId, pillarId, and contentPath fields
export const getPageBySlug = async (slug: string) => {
  try {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const pillarIds = [
      "nursing-entrance-exam",
      "nursing-exit-exam",
      "nursing-test-bank",
    ];

    // Search across all pillar pages and their sub-collections
    for (const pillarId of pillarIds) {
      // 1. Search in subPages
      const subPagesRef = collection(db, "pillarPages", pillarId, "subPages");
      const subPagesQuery = query(
        subPagesRef,
        where("slug", "==", normalizedSlug)
      );
      const subPagesSnapshot = await getDocs(subPagesQuery);

      if (!subPagesSnapshot.empty) {
        const doc = subPagesSnapshot.docs[0];
        const data = doc.data();
        return {
          success: true,
          data: {
            id: doc.id,
            ...data,
          },
          type: data.type || "sub",
          pillarId: data.pillarId || pillarId,
          parentId: data.parentId || pillarId,
          contentPath:
            data.contentPath || `pillarPages/${pillarId}/subPages/${doc.id}`,
        };
      }

      // 2. Search in nestedSubPages (need to iterate through all subPages)
      const allSubPagesSnapshot = await getDocs(subPagesRef);
      for (const subPageDoc of allSubPagesSnapshot.docs) {
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageDoc.id,
          "nestedSubPages"
        );
        const nestedQuery = query(
          nestedSubPagesRef,
          where("slug", "==", normalizedSlug)
        );
        const nestedSnapshot = await getDocs(nestedQuery);

        if (!nestedSnapshot.empty) {
          const doc = nestedSnapshot.docs[0];
          const data = doc.data();
          return {
            success: true,
            data: {
              id: doc.id,
              ...data,
            },
            type: data.type || "nested",
            pillarId: data.pillarId || pillarId,
            parentId: data.parentId || subPageDoc.id,
            contentPath:
              data.contentPath ||
              `pillarPages/${pillarId}/subPages/${subPageDoc.id}/nestedSubPages/${doc.id}`,
          };
        }

        // 3. Search in topics (under nestedSubPages)
        const allNestedSubPagesSnapshot = await getDocs(nestedSubPagesRef);
        for (const nestedDoc of allNestedSubPagesSnapshot.docs) {
          const topicsRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageDoc.id,
            "nestedSubPages",
            nestedDoc.id,
            "topics"
          );
          const topicsQuery = query(
            topicsRef,
            where("slug", "==", normalizedSlug)
          );
          const topicsSnapshot = await getDocs(topicsQuery);

          if (!topicsSnapshot.empty) {
            const doc = topicsSnapshot.docs[0];
            const data = doc.data();
            return {
              success: true,
              data: {
                id: doc.id,
                ...data,
              },
              type: data.type || "topic",
              pillarId: data.pillarId || pillarId,
              parentId: data.parentId || subPageDoc.id,
              nestedSubPageId: data.nestedSubPageId || nestedDoc.id,
              contentPath:
                data.contentPath ||
                `pillarPages/${pillarId}/subPages/${subPageDoc.id}/nestedSubPages/${nestedDoc.id}/topics/${doc.id}`,
            };
          }
        }

        // 4. Search in quizzes (under nestedSubPages)
        for (const nestedDoc of allNestedSubPagesSnapshot.docs) {
          const quizzesRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageDoc.id,
            "nestedSubPages",
            nestedDoc.id,
            "quizzes"
          );
          const quizzesQuery = query(
            quizzesRef,
            where("slug", "==", normalizedSlug)
          );
          const quizzesSnapshot = await getDocs(quizzesQuery);

          if (!quizzesSnapshot.empty) {
            const doc = quizzesSnapshot.docs[0];
            const data = doc.data();
            // For quizzes, nestedSubPageId should always be the document ID of the parent nested sub-page
            // Use the value from the quiz document data (which is set during creation/update)
            // This is the authoritative source for the parent relationship
            const quizNestedSubPageId = data.nestedSubPageId || nestedDoc.id;
            return {
              success: true,
              data: {
                id: doc.id,
                ...data,
              },
              type: data.type || "quiz",
              pillarId: data.pillarId || pillarId,
              parentId: data.parentId || subPageDoc.id,
              nestedSubPageId: quizNestedSubPageId, // Always use the parent nested sub-page's document ID
              contentPath:
                data.contentPath ||
                `pillarPages/${pillarId}/subPages/${subPageDoc.id}/nestedSubPages/${quizNestedSubPageId}/quizzes/${doc.id}`,
            };
          }
        }

        // 5. Search in quizzes (under topics - for nursing test bank)
        for (const nestedDoc of allNestedSubPagesSnapshot.docs) {
          const topicsRef = collection(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            subPageDoc.id,
            "nestedSubPages",
            nestedDoc.id,
            "topics"
          );
          const allTopicsSnapshot = await getDocs(topicsRef);

          for (const topicDoc of allTopicsSnapshot.docs) {
            const quizzesRef = collection(
              db,
              "pillarPages",
              pillarId,
              "subPages",
              subPageDoc.id,
              "nestedSubPages",
              nestedDoc.id,
              "topics",
              topicDoc.id,
              "quizzes"
            );
            const quizzesQuery = query(
              quizzesRef,
              where("slug", "==", normalizedSlug)
            );
            const quizzesSnapshot = await getDocs(quizzesQuery);

            if (!quizzesSnapshot.empty) {
              const doc = quizzesSnapshot.docs[0];
              const data = doc.data();
              return {
                success: true,
                data: {
                  id: doc.id,
                  ...data,
                },
                type: data.type || "quiz",
                pillarId: data.pillarId || pillarId,
                parentId: data.parentId || subPageDoc.id,
                nestedSubPageId: data.nestedSubPageId || nestedDoc.id,
                topicId: data.topicId || topicDoc.id,
                contentPath:
                  data.contentPath ||
                  `pillarPages/${pillarId}/subPages/${subPageDoc.id}/nestedSubPages/${nestedDoc.id}/topics/${topicDoc.id}/quizzes/${doc.id}`,
              };
            }
          }
        }
      }
    }

    return {
      success: false,
      message: `No page found with slug: ${slug}`,
    };
  } catch (error) {
    console.error(`Error getting page by slug ${slug}:`, error);
    return {
      success: false,
      message: `Failed to retrieve page by slug ${slug}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Load page content using contentPath
export const getPageByContentPath = async (contentPath: string) => {
  try {
    const pathParts = contentPath.split("/");
    
    // Handle knowledgeBase/{docId} paths (2 parts)
    if (pathParts.length === 2 && pathParts[0] === "knowledgeBase") {
      const docRef = doc(db, "knowledgeBase", pathParts[1]);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data(),
          },
        };
      } else {
        return {
          success: false,
          message: `No KB article found at contentPath: ${contentPath}`,
        };
      }
    }
    
    if (pathParts.length < 4) {
      return {
        success: false,
        message: `Invalid contentPath format: ${contentPath}`,
      };
    }

    // Expected format: pillarPages/{pillarId}/subPages/{subPageId}/...
    // Build doc reference based on path length
    let docRef;
    if (pathParts.length === 4) {
      // pillarPages/{pillarId}/subPages/{subPageId}
      docRef = doc(db, pathParts[0], pathParts[1], pathParts[2], pathParts[3]);
    } else if (pathParts.length === 6) {
      // pillarPages/{pillarId}/subPages/{subPageId}/nestedSubPages/{nestedSubPageId}
      docRef = doc(
        db,
        pathParts[0],
        pathParts[1],
        pathParts[2],
        pathParts[3],
        pathParts[4],
        pathParts[5]
      );
    } else if (pathParts.length === 8) {
      // pillarPages/{pillarId}/subPages/{subPageId}/nestedSubPages/{nestedSubPageId}/quizzes/{quizId}
      // or pillarPages/{pillarId}/subPages/{subPageId}/nestedSubPages/{nestedSubPageId}/topics/{topicId}
      docRef = doc(
        db,
        pathParts[0],
        pathParts[1],
        pathParts[2],
        pathParts[3],
        pathParts[4],
        pathParts[5],
        pathParts[6],
        pathParts[7]
      );
    } else if (pathParts.length === 10) {
      // pillarPages/{pillarId}/subPages/{subPageId}/nestedSubPages/{nestedSubPageId}/topics/{topicId}/quizzes/{quizId}
      docRef = doc(
        db,
        pathParts[0],
        pathParts[1],
        pathParts[2],
        pathParts[3],
        pathParts[4],
        pathParts[5],
        pathParts[6],
        pathParts[7],
        pathParts[8],
        pathParts[9]
      );
    } else {
      return {
        success: false,
        message: `Unsupported contentPath format: ${contentPath}`,
      };
    }

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
        },
      };
    } else {
      return {
        success: false,
        message: `No document found at contentPath: ${contentPath}`,
      };
    }
  } catch (error) {
    console.error(`Error getting page by contentPath ${contentPath}:`, error);
    return {
      success: false,
      message: `Failed to retrieve page by contentPath ${contentPath}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get KB article by slug (fallback when route mapping doesn't exist)
export const getKbArticleBySlug = async (slug: string) => {
  try {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-").trim();
    const kbArticlesRef = collection(db, "knowledgeBase");
    const slugQuery = query(
      kbArticlesRef,
      where("slug", "==", normalizedSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const doc = slugSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
      };
    }

    return {
      success: false,
      message: `No KB article found with slug: ${slug}`,
    };
  } catch (error) {
    console.error(`Error getting KB article by slug ${slug}:`, error);
    return {
      success: false,
      message: `Failed to retrieve KB article: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== ROUTE MAPPINGS OPERATIONS ====================

// Create or update a route mapping
export const createRouteMapping = async (mappingData: {
  type: "sub" | "nested" | "topic" | "quiz";
  pillarId: string;
  slug: string;
  subPageId?: string | null;
  nestedPageId?: string | null;
  topicId?: string | null;
  quizId?: string | null;
  refPath: string;
}) => {
  try {
    const normalizedSlug = mappingData.slug.toLowerCase().replace(/\s+/g, "-");
    const routeMappingsRef = collection(db, "routeMappings");

    // First, check if a route mapping already exists for this refPath (most reliable)
    // This ensures that if the slug changes, we update the existing mapping instead of creating a duplicate
    const refPathQuery = query(
      routeMappingsRef,
      where("refPath", "==", mappingData.refPath)
    );
    const refPathSnapshot = await getDocs(refPathQuery);

    const mappingDoc = {
      type: mappingData.type,
      pillarId: mappingData.pillarId,
      slug: normalizedSlug,
      subPageId: mappingData.subPageId || null,
      nestedPageId: mappingData.nestedPageId || null,
      topicId: mappingData.topicId || null,
      quizId: mappingData.quizId || null,
      refPath: mappingData.refPath,
      lastUpdated: new Date().toISOString(),
    };

    if (!refPathSnapshot.empty) {
      // Update existing mapping by refPath (slug may have changed)
      const existingDoc = refPathSnapshot.docs[0];
      await setDoc(doc(db, "routeMappings", existingDoc.id), mappingDoc, {
        merge: true,
      });

      // If the slug changed, also delete any old mappings with the old slug (to prevent duplicates)
      const oldData = existingDoc.data();
      if (oldData.slug && oldData.slug !== normalizedSlug) {
        const oldSlugQuery = query(
          routeMappingsRef,
          where("pillarId", "==", mappingData.pillarId),
          where("slug", "==", oldData.slug)
        );
        const oldSlugSnapshot = await getDocs(oldSlugQuery);
        // Delete old mappings with the old slug (except the one we just updated)
        const deletePromises = oldSlugSnapshot.docs
          .filter((doc) => doc.id !== existingDoc.id)
          .map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      return {
        success: true,
        message: "Route mapping updated successfully!",
        data: { id: existingDoc.id, ...mappingDoc },
      };
    }

    // If no mapping found by refPath, check by slug and pillarId
    const slugQuery = query(
      routeMappingsRef,
      where("pillarId", "==", mappingData.pillarId),
      where("slug", "==", normalizedSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      // Update existing mapping by slug
      const existingDoc = slugSnapshot.docs[0];
      await setDoc(doc(db, "routeMappings", existingDoc.id), mappingDoc, {
        merge: true,
      });
      return {
        success: true,
        message: "Route mapping updated successfully!",
        data: { id: existingDoc.id, ...mappingDoc },
      };
    }

    // Create new mapping
    const newDocRef = await addDoc(routeMappingsRef, mappingDoc);
    return {
      success: true,
      message: "Route mapping created successfully!",
      data: { id: newDocRef.id, ...mappingDoc },
    };
  } catch (error) {
    console.error("Error creating route mapping:", error);
    return {
      success: false,
      message: `Failed to create route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get route mapping by slug and pillarId
export const getRouteMappingBySlug = async (pillarId: string, slug: string) => {
  try {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const routeMappingsRef = collection(db, "routeMappings");
    const mappingQuery = query(
      routeMappingsRef,
      where("pillarId", "==", pillarId),
      where("slug", "==", normalizedSlug)
    );
    const mappingSnapshot = await getDocs(mappingQuery);

    if (!mappingSnapshot.empty) {
      const doc = mappingSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
      };
    }

    return {
      success: false,
      message: `No route mapping found for slug: ${slug} in pillar: ${pillarId}`,
    };
  } catch (error) {
    console.error(
      `Error getting route mapping for ${pillarId}/${slug}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get route mapping by slug only (searches across all pillar pages)
export const getRouteMappingBySlugOnly = async (slug: string) => {
  try {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-").trim();
    const routeMappingsRef = collection(db, "routeMappings");
    const mappingQuery = query(
      routeMappingsRef,
      where("slug", "==", normalizedSlug)
    );
    const mappingSnapshot = await getDocs(mappingQuery);

    if (!mappingSnapshot.empty) {
      const doc = mappingSnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
      };
    }

    return {
      success: false,
      message: `No route mapping found for slug: ${slug}`,
    };
  } catch (error) {
    console.error(`Error getting route mapping for slug ${slug}:`, error);
    return {
      success: false,
      message: `Failed to retrieve route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Check if a slug is available (not in route mappings or static routes)
export const isSlugAvailable = async (
  slug: string
): Promise<{
  available: boolean;
  message?: string;
}> => {
  try {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-").trim();

    if (!normalizedSlug) {
      return {
        available: false,
        message: "Slug cannot be empty.",
      };
    }

    // List of static routes that cannot be used as slugs
    const staticRoutes = [
      "",
      "login",
      "register",
      "forgot-password",
      "admin",
      "blog",
      "dashboard",
      "profile",
      "referrals",
      "payments",
      "payment",
      "contact",
      "prices",
      "about",
      "how-it-works",
      "faqs",
      "faq",
      "teas",
      "nursing",
      "nursing-test-bank",
      "nursing-exit-exam",
      "nursing-entrance-exam",
      "guarantees",
      "money-back-guarantee",
      "privacy-policy",
      "terms-and-conditions",
      "thank-you",
      "progress-reports",
      "support",
      "reading",
      "api",
      "robots",
      "sitemap",
      "favicon",
      "knowledge-base",
    ];

    // Check if slug matches any static route
    if (staticRoutes.includes(normalizedSlug)) {
      return {
        available: false,
        message: `The slug "${normalizedSlug}" is reserved and cannot be used. Please choose a different slug.`,
      };
    }

    // Check if slug exists in route mappings
    const routeMappingCheck = await getRouteMappingBySlugOnly(normalizedSlug);

    // If no route mapping found, slug is available
    if (!routeMappingCheck.success || !routeMappingCheck.data) {
      return {
        available: true,
      };
    }

    // Route mapping exists - verify that the actual page document exists
    const routeMapping = routeMappingCheck.data as any;
    const refPath = routeMapping.refPath as string | undefined;

    // If we don't have a refPath, treat as orphaned mapping and allow the slug
    if (!refPath) {
      console.warn(
        `Found route mapping for slug "${normalizedSlug}" without refPath. Treating as orphaned.`
      );
      try {
        await deleteRouteMapping(routeMapping.id as string);
      } catch (deleteError) {
        console.error(`Failed to delete orphaned route mapping:`, deleteError);
      }
      return {
        available: true,
      };
    }

    // Verify that the actual page document exists
    try {
      // Convert refPath to Firestore document reference
      // refPath format: "pillarPages/{pillarId}/subPages/{subPageId}/..."
      const pathSegments = refPath.split("/").filter((segment) => segment);

      // Validate path segments
      if (pathSegments.length < 2) {
        console.warn(
          `Invalid refPath "${refPath}" for slug "${normalizedSlug}". Treating as orphaned.`
        );
        try {
          await deleteRouteMapping(routeMapping.id as string);
        } catch (deleteError) {
          console.error(
            `Failed to delete orphaned route mapping:`,
            deleteError
          );
        }
        return {
          available: true,
        };
      }

      const docRef = doc(db, ...(pathSegments as [string, ...string[]]));
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Route mapping exists but page doesn't - this is an orphaned mapping
        // Clean it up and consider the slug as available
        console.warn(
          `Found orphaned route mapping for slug "${normalizedSlug}" with refPath "${refPath}". Page does not exist. Cleaning up...`
        );
        try {
          await deleteRouteMapping(routeMapping.id as string);
        } catch (deleteError) {
          console.error(
            `Failed to delete orphaned route mapping:`,
            deleteError
          );
        }
        // Slug is available since the page doesn't exist
        return {
          available: true,
        };
      }

      // Page exists, so slug is taken
      return {
        available: false,
        message: `A page with the slug "${normalizedSlug}" already exists. Please choose a different slug.`,
      };
    } catch (error) {
      // If we can't verify the page exists due to an error, log it but allow the slug
      // This prevents false positives from blocking legitimate slug creation
      console.error(
        `Error verifying page existence for slug "${normalizedSlug}" with refPath "${refPath}":`,
        error
      );
      // Treat as orphaned mapping and allow the slug
      try {
        await deleteRouteMapping(routeMapping.id as string);
      } catch (deleteError) {
        console.error(`Failed to delete orphaned route mapping:`, deleteError);
      }
      return {
        available: true,
      };
    }

    return {
      available: true,
    };
  } catch (error) {
    console.error(`Error checking slug availability for ${slug}:`, error);
    return {
      available: false,
      message: `Failed to check slug availability: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get route mapping by ID (for sub pages, nested pages, topics, quizzes)
export const getRouteMappingById = async (params: {
  pillarId: string;
  type: "sub" | "nested" | "topic" | "quiz";
  id: string; // subPageId, nestedPageId, topicId, or quizId
  subPageId?: string | null; // For nested/topic/quiz to filter by parent
  nestedPageId?: string | null; // For topic/quiz to filter by parent
}) => {
  try {
    const routeMappingsRef = collection(db, "routeMappings");
    const baseQuery = query(
      routeMappingsRef,
      where("pillarId", "==", params.pillarId),
      where("type", "==", params.type)
    );
    const snapshot = await getDocs(baseQuery);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let matches = false;

      if (params.type === "sub") {
        // For sub pages, check if refPath contains the ID
        matches =
          data.refPath?.endsWith(`/subPages/${params.id}`) ||
          data.refPath?.includes(`/subPages/${params.id}/`) ||
          data.subPageId === params.id;
      } else if (params.type === "nested") {
        matches = data.nestedPageId === params.id;
        if (matches && params.subPageId) {
          matches = data.subPageId === params.subPageId;
        }
      } else if (params.type === "topic") {
        matches = data.topicId === params.id;
        if (matches && params.nestedPageId) {
          matches = data.nestedPageId === params.nestedPageId;
        }
        if (matches && params.subPageId) {
          matches = data.subPageId === params.subPageId;
        }
      } else if (params.type === "quiz") {
        matches = data.quizId === params.id;
        if (matches && params.nestedPageId) {
          matches = data.nestedPageId === params.nestedPageId;
        }
        if (matches && params.subPageId) {
          matches = data.subPageId === params.subPageId;
        }
      }

      if (matches) {
        return {
          success: true,
          data: {
            id: doc.id,
            ...data,
          },
        };
      }
    }

    return {
      success: false,
      message: `No route mapping found for ${params.type} with id: ${params.id}`,
    };
  } catch (error) {
    console.error(
      `Error getting route mapping for ${params.type}/${params.id}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete route mapping by mapping ID
export const deleteRouteMapping = async (mappingId: string) => {
  try {
    await deleteDoc(doc(db, "routeMappings", mappingId));
    return {
      success: true,
      message: "Route mapping deleted successfully!",
    };
  } catch (error) {
    console.error(`Error deleting route mapping ${mappingId}:`, error);
    return {
      success: false,
      message: `Failed to delete route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Find and delete route mapping by refPath or by IDs
export const deleteRouteMappingByRefPath = async (refPath: string) => {
  try {
    const routeMappingsRef = collection(db, "routeMappings");
    const mappingQuery = query(
      routeMappingsRef,
      where("refPath", "==", refPath)
    );
    const mappingSnapshot = await getDocs(mappingQuery);

    if (!mappingSnapshot.empty) {
      const deletePromises = mappingSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      return {
        success: true,
        message: `Route mapping(s) deleted successfully for refPath: ${refPath}`,
        deletedCount: mappingSnapshot.docs.length,
      };
    }

    return {
      success: true,
      message: `No route mapping found for refPath: ${refPath}`,
      deletedCount: 0,
    };
  } catch (error) {
    console.error(`Error deleting route mapping by refPath ${refPath}:`, error);
    return {
      success: false,
      message: `Failed to delete route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Find and delete route mapping by IDs (subPageId, nestedPageId, topicId, quizId)
export const deleteRouteMappingByIds = async (params: {
  pillarId: string;
  subPageId?: string | null;
  nestedPageId?: string | null;
  topicId?: string | null;
  quizId?: string | null;
}) => {
  try {
    const routeMappingsRef = collection(db, "routeMappings");
    let mappingQuery = query(
      routeMappingsRef,
      where("pillarId", "==", params.pillarId)
    );

    // Build query based on provided IDs
    if (params.quizId) {
      mappingQuery = query(
        routeMappingsRef,
        where("pillarId", "==", params.pillarId),
        where("quizId", "==", params.quizId)
      );
    } else if (params.topicId) {
      mappingQuery = query(
        routeMappingsRef,
        where("pillarId", "==", params.pillarId),
        where("topicId", "==", params.topicId)
      );
    } else if (params.nestedPageId) {
      mappingQuery = query(
        routeMappingsRef,
        where("pillarId", "==", params.pillarId),
        where("nestedPageId", "==", params.nestedPageId)
      );
    } else if (params.subPageId) {
      mappingQuery = query(
        routeMappingsRef,
        where("pillarId", "==", params.pillarId),
        where("subPageId", "==", params.subPageId)
      );
    }

    const mappingSnapshot = await getDocs(mappingQuery);

    if (!mappingSnapshot.empty) {
      const deletePromises = mappingSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      return {
        success: true,
        message: `Route mapping(s) deleted successfully`,
        deletedCount: mappingSnapshot.docs.length,
      };
    }

    return {
      success: true,
      message: `No route mapping found for the provided IDs`,
      deletedCount: 0,
    };
  } catch (error) {
    console.error(`Error deleting route mapping by IDs:`, error);
    return {
      success: false,
      message: `Failed to delete route mapping: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get route mapping slugs by IDs (for nested pages, topics, quizzes)
export const getRouteMappingSlugsByIds = async (params: {
  pillarId: string;
  type: "nested" | "topic" | "quiz";
  ids: string[];
  subPageId?: string | null;
  nestedPageId?: string | null;
  topicId?: string | null;
}) => {
  try {
    const routeMappingsRef = collection(db, "routeMappings");
    const slugMap: Record<string, string> = {};

    // Query all route mappings of the specified type for this pillar
    const baseQuery = query(
      routeMappingsRef,
      where("pillarId", "==", params.pillarId),
      where("type", "==", params.type)
    );
    const snapshot = await getDocs(baseQuery);

    // Filter and map by IDs
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      let id: string | null = null;

      if (params.type === "nested") {
        id = data.nestedPageId;
        if (id && params.ids.includes(id)) {
          // For nested pages, also check subPageId if provided
          if (!params.subPageId || data.subPageId === params.subPageId) {
            slugMap[id] = data.slug;
          }
        }
      } else if (params.type === "topic") {
        id = data.topicId;
        if (id && params.ids.includes(id)) {
          // For topics, also check nestedPageId if provided
          if (
            !params.nestedPageId ||
            data.nestedPageId === params.nestedPageId
          ) {
            slugMap[id] = data.slug;
          }
        }
      } else if (params.type === "quiz") {
        id = data.quizId;
        if (id && params.ids.includes(id)) {
          // For quizzes, check nestedPageId and topicId if provided
          let matches = true;
          if (
            params.nestedPageId &&
            data.nestedPageId !== params.nestedPageId
          ) {
            matches = false;
          }
          if (params.topicId && data.topicId !== params.topicId) {
            matches = false;
          }
          if (matches) {
            slugMap[id] = data.slug;
          }
        }
      }
    });

    return {
      success: true,
      slugMap,
    };
  } catch (error) {
    console.error(`Error getting route mapping slugs by IDs:`, error);
    return {
      success: false,
      message: `Failed to get route mapping slugs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      slugMap: {},
    };
  }
};

// Get all route mappings (for static generation)
export const getAllRouteMappings = async () => {
  try {
    const routeMappingsRef = collection(db, "routeMappings");
    const snapshot = await getDocs(routeMappingsRef);

    const routeMappings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: routeMappings,
    };
  } catch (error) {
    console.error("Error getting all route mappings:", error);
    return {
      success: false,
      message: `Failed to retrieve all route mappings: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== QUESTION COUNT OPERATIONS ====================

// Helper function to count questions in a quiz collection
// Only counts questions with supported types: 1, 2, 3, 7
const countQuestionsInQuiz = async (
  pathSegments: string[]
): Promise<number> => {
  try {
    const questionsRef = collection(
      db,
      ...(pathSegments as [string, ...string[]]),
      "questions"
    );
    const snapshot = await getDocs(questionsRef);

    // Supported question types: 1, 2, 3, 7
    const supportedTypes = [1, 2, 3, 7];
    let count = 0;

    snapshot.forEach((doc) => {
      const questionData = doc.data();
      const questionTypeId =
        questionData.question_type_id || questionData.questionTypeId || 1;
      // Convert to number if it's a string
      const typeId =
        typeof questionTypeId === "string"
          ? parseInt(questionTypeId, 10)
          : questionTypeId;

      if (supportedTypes.includes(typeId)) {
        count++;
      }
    });

    return count;
  } catch (error) {
    console.error("Error counting questions in quiz:", error);
    return 0;
  }
};

// Count questions in a single quiz (for test bank)
export const countQuizQuestions = async (
  subPageId: string,
  nestedSubPageId: string,
  topicId: string,
  quizId: string
): Promise<number> => {
  try {
    const pillarId = "nursing-test-bank";

    // Resolve IDs
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", subPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);
    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        subPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      }
    }

    let resolvedNestedId: string | null = null;
    if (resolvedParentId) {
      const normalizedNestedSlug = nestedSubPageId
        .toLowerCase()
        .replace(/\s+/g, "-");
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages"
      );
      const nestedSlugQuery = query(
        nestedSubPagesRef,
        where("slug", "==", normalizedNestedSlug)
      );
      const nestedSlugSnapshot = await getDocs(nestedSlugQuery);
      if (!nestedSlugSnapshot.empty) {
        resolvedNestedId = nestedSlugSnapshot.docs[0].id;
      } else {
        const nestedDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          nestedSubPageId
        );
        const nestedDocSnap = await getDoc(nestedDocRef);
        if (nestedDocSnap.exists()) {
          resolvedNestedId = nestedDocSnap.id;
        }
      }
    }

    let resolvedTopicId: string | null = null;
    if (resolvedNestedId) {
      const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
      const topicsRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId!,
        "nestedSubPages",
        resolvedNestedId,
        "topics"
      );
      const topicSlugQuery = query(
        topicsRef,
        where("slug", "==", normalizedTopicSlug)
      );
      const topicSlugSnapshot = await getDocs(topicSlugQuery);
      if (!topicSlugSnapshot.empty) {
        resolvedTopicId = topicSlugSnapshot.docs[0].id;
      } else {
        const topicDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId!,
          "nestedSubPages",
          resolvedNestedId,
          "topics",
          topicId
        );
        const topicDocSnap = await getDoc(topicDocRef);
        if (topicDocSnap.exists()) {
          resolvedTopicId = topicDocSnap.id;
        }
      }
    }

    if (resolvedParentId && resolvedNestedId && resolvedTopicId) {
      // Resolve quiz ID
      const quizzesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes"
      );
      const quizSlugQuery = query(
        quizzesRef,
        where("slug", "==", quizId.toLowerCase().replace(/\s+/g, "-"))
      );
      const quizSlugSnapshot = await getDocs(quizSlugQuery);
      let resolvedQuizId = quizId;

      if (!quizSlugSnapshot.empty) {
        resolvedQuizId = quizSlugSnapshot.docs[0].id;
      } else {
        const quizDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          resolvedNestedId,
          "topics",
          resolvedTopicId,
          "quizzes",
          quizId
        );
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          resolvedQuizId = quizDocSnap.id;
        }
      }

      const count = await countQuestionsInQuiz([
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "topics",
        resolvedTopicId,
        "quizzes",
        resolvedQuizId,
      ]);
      return count;
    }

    return 0;
  } catch (error) {
    console.error("Error counting quiz questions:", error);
    return 0;
  }
};

// Count questions in a single quiz (for exit/entrance exams)
export const countExitEntranceQuizQuestions = async (
  pillarId: "nursing-exit-exam" | "nursing-entrance-exam",
  subPageId: string,
  nestedSubPageId: string,
  quizId: string
): Promise<number> => {
  try {
    // Resolve IDs
    let resolvedParentId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", subPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);
    if (!parentSlugSnapshot.empty) {
      resolvedParentId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        subPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedParentId = parentDocSnap.id;
      }
    }

    let resolvedNestedId: string | null = null;
    if (resolvedParentId) {
      const normalizedNestedSlug = nestedSubPageId
        .toLowerCase()
        .replace(/\s+/g, "-");
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages"
      );
      const nestedSlugQuery = query(
        nestedSubPagesRef,
        where("slug", "==", normalizedNestedSlug)
      );
      const nestedSlugSnapshot = await getDocs(nestedSlugQuery);
      if (!nestedSlugSnapshot.empty) {
        resolvedNestedId = nestedSlugSnapshot.docs[0].id;
      } else {
        const nestedDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          nestedSubPageId
        );
        const nestedDocSnap = await getDoc(nestedDocRef);
        if (nestedDocSnap.exists()) {
          resolvedNestedId = nestedDocSnap.id;
        }
      }
    }

    if (resolvedParentId && resolvedNestedId) {
      // Resolve quiz ID
      const quizzesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes"
      );
      const quizSlugQuery = query(
        quizzesRef,
        where("slug", "==", quizId.toLowerCase().replace(/\s+/g, "-"))
      );
      const quizSlugSnapshot = await getDocs(quizSlugQuery);
      let resolvedQuizId = quizId;

      if (!quizSlugSnapshot.empty) {
        resolvedQuizId = quizSlugSnapshot.docs[0].id;
      } else {
        const quizDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages",
          resolvedNestedId,
          "quizzes",
          quizId
        );
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          resolvedQuizId = quizDocSnap.id;
        }
      }

      const count = await countQuestionsInQuiz([
        "pillarPages",
        pillarId,
        "subPages",
        resolvedParentId,
        "nestedSubPages",
        resolvedNestedId,
        "quizzes",
        resolvedQuizId,
      ]);
      return count;
    }

    return 0;
  } catch (error) {
    console.error("Error counting quiz questions:", error);
    return 0;
  }
};

// Count questions for a topic (nursing-test-bank)
export const countTopicQuestions = async (
  subPageId: string,
  nestedSubPageId: string,
  topicId: string
): Promise<number> => {
  try {
    const pillarId = "nursing-test-bank";
    let totalCount = 0;

    // Get all quizzes for this topic
    const quizzesResult = await getNursingTestBankQuizzes(
      subPageId,
      nestedSubPageId,
      topicId
    );

    if (quizzesResult.success && quizzesResult.data) {
      // Resolve IDs (similar to how getNursingTestBankQuizzes does it)
      let resolvedParentId: string | null = null;
      const parentSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages"
      );
      const parentSlugQuery = query(
        parentSubPagesRef,
        where("slug", "==", subPageId.toLowerCase().replace(/\s+/g, "-"))
      );
      const parentSlugSnapshot = await getDocs(parentSlugQuery);
      if (!parentSlugSnapshot.empty) {
        resolvedParentId = parentSlugSnapshot.docs[0].id;
      } else {
        const parentDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId
        );
        const parentDocSnap = await getDoc(parentDocRef);
        if (parentDocSnap.exists()) {
          resolvedParentId = parentDocSnap.id;
        }
      }

      let resolvedNestedId: string | null = null;
      if (resolvedParentId) {
        const normalizedNestedSlug = nestedSubPageId
          .toLowerCase()
          .replace(/\s+/g, "-");
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages"
        );
        const nestedSlugQuery = query(
          nestedSubPagesRef,
          where("slug", "==", normalizedNestedSlug)
        );
        const nestedSlugSnapshot = await getDocs(nestedSlugQuery);
        if (!nestedSlugSnapshot.empty) {
          resolvedNestedId = nestedSlugSnapshot.docs[0].id;
        } else {
          const nestedDocRef = doc(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            resolvedParentId,
            "nestedSubPages",
            nestedSubPageId
          );
          const nestedDocSnap = await getDoc(nestedDocRef);
          if (nestedDocSnap.exists()) {
            resolvedNestedId = nestedDocSnap.id;
          }
        }
      }

      let resolvedTopicId: string | null = null;
      if (resolvedNestedId) {
        const normalizedTopicSlug = topicId.toLowerCase().replace(/\s+/g, "-");
        const topicsRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId!,
          "nestedSubPages",
          resolvedNestedId,
          "topics"
        );
        const topicSlugQuery = query(
          topicsRef,
          where("slug", "==", normalizedTopicSlug)
        );
        const topicSlugSnapshot = await getDocs(topicSlugQuery);
        if (!topicSlugSnapshot.empty) {
          resolvedTopicId = topicSlugSnapshot.docs[0].id;
        } else {
          const topicDocRef = doc(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            resolvedParentId!,
            "nestedSubPages",
            resolvedNestedId,
            "topics",
            topicId
          );
          const topicDocSnap = await getDoc(topicDocRef);
          if (topicDocSnap.exists()) {
            resolvedTopicId = topicDocSnap.id;
          }
        }
      }

      if (resolvedParentId && resolvedNestedId && resolvedTopicId) {
        // Count questions in each quiz
        for (const quiz of quizzesResult.data) {
          const quizId = quiz.id || quiz.quizId;
          const count = await countQuestionsInQuiz([
            "pillarPages",
            pillarId,
            "subPages",
            resolvedParentId,
            "nestedSubPages",
            resolvedNestedId,
            "topics",
            resolvedTopicId,
            "quizzes",
            quizId,
          ]);
          totalCount += count;
        }
      }
    }

    return totalCount;
  } catch (error) {
    console.error("Error counting topic questions:", error);
    return 0;
  }
};

// Count questions for a nested page (nursing-exit-exam, nursing-entrance-exam)
export const countNestedPageQuestions = async (
  pillarId: "nursing-exit-exam" | "nursing-entrance-exam",
  subPageId: string,
  nestedSubPageId: string
): Promise<number> => {
  try {
    let totalCount = 0;

    // Get all quizzes for this nested page
    let quizzesResult;
    if (pillarId === "nursing-exit-exam") {
      quizzesResult = await getNursingExitExamQuizzes(
        subPageId,
        nestedSubPageId
      );
    } else {
      quizzesResult = await getNursingEntranceExamQuizzes(
        subPageId,
        nestedSubPageId
      );
    }

    if (quizzesResult.success && quizzesResult.data) {
      // Resolve IDs
      let resolvedParentId: string | null = null;
      const parentSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages"
      );
      const parentSlugQuery = query(
        parentSubPagesRef,
        where("slug", "==", subPageId.toLowerCase().replace(/\s+/g, "-"))
      );
      const parentSlugSnapshot = await getDocs(parentSlugQuery);
      if (!parentSlugSnapshot.empty) {
        resolvedParentId = parentSlugSnapshot.docs[0].id;
      } else {
        const parentDocRef = doc(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          subPageId
        );
        const parentDocSnap = await getDoc(parentDocRef);
        if (parentDocSnap.exists()) {
          resolvedParentId = parentDocSnap.id;
        }
      }

      let resolvedNestedId: string | null = null;
      if (resolvedParentId) {
        const normalizedNestedSlug = nestedSubPageId
          .toLowerCase()
          .replace(/\s+/g, "-");
        const nestedSubPagesRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedParentId,
          "nestedSubPages"
        );
        const nestedSlugQuery = query(
          nestedSubPagesRef,
          where("slug", "==", normalizedNestedSlug)
        );
        const nestedSlugSnapshot = await getDocs(nestedSlugQuery);
        if (!nestedSlugSnapshot.empty) {
          resolvedNestedId = nestedSlugSnapshot.docs[0].id;
        } else {
          const nestedDocRef = doc(
            db,
            "pillarPages",
            pillarId,
            "subPages",
            resolvedParentId,
            "nestedSubPages",
            nestedSubPageId
          );
          const nestedDocSnap = await getDoc(nestedDocRef);
          if (nestedDocSnap.exists()) {
            resolvedNestedId = nestedDocSnap.id;
          }
        }
      }

      if (resolvedParentId && resolvedNestedId) {
        // Count questions in each quiz
        for (const quiz of quizzesResult.data) {
          const quizId = quiz.id || quiz.quizId;
          const count = await countQuestionsInQuiz([
            "pillarPages",
            pillarId,
            "subPages",
            resolvedParentId,
            "nestedSubPages",
            resolvedNestedId,
            "quizzes",
            quizId,
          ]);
          totalCount += count;
        }
      }
    }

    return totalCount;
  } catch (error) {
    console.error("Error counting nested page questions:", error);
    return 0;
  }
};

// Count questions for a sub-page
export const countSubPageQuestions = async (
  pillarId: string,
  subPageId: string
): Promise<number> => {
  try {
    let totalCount = 0;

    // Resolve sub-page ID
    let resolvedSubPageId: string | null = null;
    const parentSubPagesRef = collection(
      db,
      "pillarPages",
      pillarId,
      "subPages"
    );
    const parentSlugQuery = query(
      parentSubPagesRef,
      where("slug", "==", subPageId.toLowerCase().replace(/\s+/g, "-"))
    );
    const parentSlugSnapshot = await getDocs(parentSlugQuery);
    if (!parentSlugSnapshot.empty) {
      resolvedSubPageId = parentSlugSnapshot.docs[0].id;
    } else {
      const parentDocRef = doc(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        subPageId
      );
      const parentDocSnap = await getDoc(parentDocRef);
      if (parentDocSnap.exists()) {
        resolvedSubPageId = parentDocSnap.id;
      }
    }

    if (!resolvedSubPageId) {
      return 0;
    }

    if (pillarId === "nursing-test-bank") {
      // For test bank: count questions in all topics under all nested pages
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedSubPageId,
        "nestedSubPages"
      );
      const nestedSnapshot = await getDocs(nestedSubPagesRef);

      for (const nestedDoc of nestedSnapshot.docs) {
        const nestedId = nestedDoc.id;
        const topicsRef = collection(
          db,
          "pillarPages",
          pillarId,
          "subPages",
          resolvedSubPageId,
          "nestedSubPages",
          nestedId,
          "topics"
        );
        const topicsSnapshot = await getDocs(topicsRef);

        for (const topicDoc of topicsSnapshot.docs) {
          const topicId = topicDoc.id;
          const count = await countTopicQuestions(
            resolvedSubPageId,
            nestedId,
            topicId
          );
          totalCount += count;
        }
      }
    } else {
      // For exit exam and entrance exam: count questions in all nested pages
      const nestedSubPagesRef = collection(
        db,
        "pillarPages",
        pillarId,
        "subPages",
        resolvedSubPageId,
        "nestedSubPages"
      );
      const nestedSnapshot = await getDocs(nestedSubPagesRef);

      for (const nestedDoc of nestedSnapshot.docs) {
        const nestedId = nestedDoc.id;
        const nestedData = nestedDoc.data();
        const nestedSlug = nestedData.slug || nestedId;
        const count = await countNestedPageQuestions(
          pillarId as "nursing-exit-exam" | "nursing-entrance-exam",
          resolvedSubPageId,
          nestedSlug
        );
        totalCount += count;
      }
    }

    return totalCount;
  } catch (error) {
    console.error("Error counting sub-page questions:", error);
    return 0;
  }
};

// Count questions for a pillar page
export const countPillarPageQuestions = async (
  pillarId: string
): Promise<number> => {
  try {
    let totalCount = 0;

    // Get all sub-pages
    let subPagesResult;
    if (pillarId === "nursing-test-bank") {
      subPagesResult = await getNursingTestBankSubPages();
    } else if (pillarId === "nursing-exit-exam") {
      subPagesResult = await getNursingExitExamSubPages();
    } else if (pillarId === "nursing-entrance-exam") {
      subPagesResult = await getNursingEntranceExamSubPages();
    } else {
      return 0;
    }

    if (subPagesResult.success && subPagesResult.data) {
      for (const subPage of subPagesResult.data) {
        const subPageId = subPage.id || subPage.subPageId;
        const subPageSlug = subPage.slug || subPageId;
        const count = await countSubPageQuestions(pillarId, subPageSlug);
        totalCount += count;
      }
    }

    return totalCount;
  } catch (error) {
    console.error("Error counting pillar page questions:", error);
    return 0;
  }
};
