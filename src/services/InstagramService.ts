
interface InstagramProfile {
  username: string;
  fullName?: string;
  profilePicUrlHD: string;
  exists: boolean;
}

interface ApifyResponse {
  username?: string;
  fullName?: string;
  profilePicUrlHD?: string;
  profilePicUrl?: string;
  biography?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  url?: string;
  urlsFromSearch?: string[];
  // Additional possible nested structures
  owner?: any;
  graphql?: any;
  data?: any;
}

export class InstagramService {
  private static APIFY_API_URL = 'https://api.apify.com/v2/actor-tasks/chatty_coaster~instagram-scraper-task/run-sync?token=apify_api_Tk435sUb2WnBllXsxxfNQaBLkHSZyz0HLRCO';

  static async getProfile(username: string): Promise<InstagramProfile> {
    try {
      console.log('🔍 Fetching Instagram profile for:', username);
      
      const cleanUsername = username.replace('@', '');
      
      // Try multiple configuration approaches
      const configurations = [
        // Configuration 1: Direct user scraping
        {
          search: cleanUsername,
          searchType: "user",
          searchLimit: 1,
          resultsType: "details",
          resultsLimit: 1,
          scrapeUserInfo: true,
          addParentData: true,
          includeHasStories: false,
          includeHasHighlights: false,
          includeRecentPosts: false,
          enhanceUserSearchWithFacebookPage: false,
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"]
          }
        },
        // Configuration 2: URL-based scraping
        {
          search: `https://www.instagram.com/${cleanUsername}/`,
          searchType: "user",
          searchLimit: 1,
          resultsType: "details",
          resultsLimit: 1,
          scrapeUserInfo: true,
          addParentData: true,
          includeHasStories: false,
          includeHasHighlights: false,
          includeRecentPosts: false,
          enhanceUserSearchWithFacebookPage: false,
          extendOutputFunction: `async ({ data }) => {
            console.log('Extended function data:', data);
            return {
              ...data,
              directProfileData: true
            };
          }`,
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"]
          }
        }
      ];

      for (let i = 0; i < configurations.length; i++) {
        const config = configurations[i];
        console.log(`🧪 Trying configuration ${i + 1}:`, JSON.stringify(config, null, 2));
        
        try {
          const response = await fetch(this.APIFY_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
          });

          if (!response.ok) {
            console.log(`❌ Configuration ${i + 1} failed:`, response.status, response.statusText);
            continue;
          }

          const responseJson = await response.json();
          console.log(`🔴 Configuration ${i + 1} response:`, responseJson);
          
          // Parse the response and extract profile data
          const profileData = this.parseApifyResponse(responseJson, cleanUsername);
          
          if (profileData && profileData.exists && profileData.profilePicUrlHD && profileData.profilePicUrlHD.trim() !== '') {
            console.log(`✅ Configuration ${i + 1} SUCCESS:`, JSON.stringify(profileData, null, 2));
            return profileData;
          }
          
          console.log(`⚠️ Configuration ${i + 1} returned partial data:`, profileData);
        } catch (error) {
          console.error(`💥 Configuration ${i + 1} error:`, error);
          continue;
        }
      }

      // If all configurations failed, return placeholder profile
      console.log('⚠️ All configurations failed, using placeholder profile');
      const placeholderProfile = {
        username: cleanUsername,
        fullName: cleanUsername,
        profilePicUrlHD: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&size=400&background=fb923c&color=ffffff&bold=true`,
        exists: true
      };
      
      return placeholderProfile;
      
    } catch (error) {
      console.error('💥 Error fetching Instagram profile:', error);
      return {
        username: username.replace('@', ''),
        fullName: undefined,
        profilePicUrlHD: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.replace('@', ''))}&size=400&background=fb923c&color=ffffff&bold=true`,
        exists: true // Changed to true so it continues the flow
      };
    }
  }

  private static parseApifyResponse(responseJson: any, username: string): InstagramProfile | null {
    console.log('🔧 PARSING - Starting to parse response for username:', username);
    
    // Function to extract profile data from an object
    const extractProfileData = (obj: any, path: string = 'root'): Partial<InstagramProfile> | null => {
      if (!obj) {
        console.log(`🔧 PARSING - Object at ${path} is null/undefined`);
        return null;
      }
      
      console.log(`🔧 PARSING - Checking object at ${path}:`, JSON.stringify(obj, null, 2));
      
      // Look for direct profile fields with comprehensive field mapping
      const possibleFields = {
        username: obj.username || obj.user_name || obj.handle || obj.userName,
        fullName: obj.fullName || obj.full_name || obj.displayName || obj.display_name || obj.name || obj.realName,
        profilePicUrlHD: obj.profilePicUrlHD || obj.profile_pic_url_hd || obj.profilePicUrl || obj.profile_pic_url || obj.avatar || obj.picture || obj.profilePictureUrl
      };

      console.log(`🔧 PARSING - Extracted fields from ${path}:`, possibleFields);

      // If we found any profile data, return it
      if (possibleFields.username || possibleFields.profilePicUrlHD) {
        console.log(`✅ PARSING - Found profile data at ${path}`);
        return possibleFields;
      }
      
      return null;
    };

    // Check direct object first
    const directExtraction = extractProfileData(responseJson, 'direct');
    if (directExtraction && directExtraction.profilePicUrlHD && !directExtraction.profilePicUrlHD.includes("ui-avatars.com")) {
      return {
        username: directExtraction.username || username,
        fullName: directExtraction.fullName || directExtraction.username || username,
        profilePicUrlHD: directExtraction.profilePicUrlHD,
        exists: true
      };
    }

    // Handle array response
    if (Array.isArray(responseJson)) {
      console.log('🔧 PARSING - Processing array response');
      
      for (let i = 0; i < responseJson.length; i++) {
        const item = responseJson[i];
        const extracted = extractProfileData(item, `array[${i}]`);
        if (extracted && extracted.profilePicUrlHD && !extracted.profilePicUrlHD.includes("ui-avatars.com")) {
          return {
            username: extracted.username || username,
            fullName: extracted.fullName || extracted.username || username,
            profilePicUrlHD: extracted.profilePicUrlHD,
            exists: true
          };
        }

        // Check nested structures within array items
        const nestedPaths = [
          { obj: item.owner, path: `array[${i}].owner` },
          { obj: item.user, path: `array[${i}].user` },
          { obj: item.graphql?.user, path: `array[${i}].graphql.user` },
          { obj: item.data, path: `array[${i}].data` },
          { obj: item.profile, path: `array[${i}].profile` },
          { obj: item.userInfo, path: `array[${i}].userInfo` }
        ];

        for (const nested of nestedPaths) {
          if (nested.obj) {
            const nestedExtracted = extractProfileData(nested.obj, nested.path);
            if (nestedExtracted && nestedExtracted.profilePicUrlHD && !nestedExtracted.profilePicUrlHD.includes("ui-avatars.com")) {
              return {
                username: nestedExtracted.username || username,
                fullName: nestedExtracted.fullName || nestedExtracted.username || username,
                profilePicUrlHD: nestedExtracted.profilePicUrlHD,
                exists: true
              };
            }
          }
        }
      }
    }

    // Check nested structures in direct object
    const nestedPaths = [
      { obj: responseJson.owner, path: 'direct.owner' },
      { obj: responseJson.user, path: 'direct.user' },
      { obj: responseJson.graphql?.user, path: 'direct.graphql.user' },
      { obj: responseJson.data, path: 'direct.data' },
      { obj: responseJson.profile, path: 'direct.profile' },
      { obj: responseJson.userInfo, path: 'direct.userInfo' }
    ];

    for (const nested of nestedPaths) {
      if (nested.obj) {
        const nestedExtracted = extractProfileData(nested.obj, nested.path);
        if (nestedExtracted && nestedExtracted.profilePicUrlHD && !nestedExtracted.profilePicUrlHD.includes("ui-avatars.com")) {
          return {
            username: nestedExtracted.username || username,
            fullName: nestedExtracted.fullName || nestedExtracted.username || username,
            profilePicUrlHD: nestedExtracted.profilePicUrlHD,
            exists: true
          };
        }
      }
    }

    console.log('❌ PARSING - No valid profile data found in response');
    return null;
  }
}
