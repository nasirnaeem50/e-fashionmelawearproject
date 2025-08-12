import React, { useState } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useCMS } from '../../../context/CMSContext';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import { 
    FiSave, FiEdit3, FiPlus, FiTrash2, FiNavigation, FiStar, FiHome, FiTag, FiLoader, 
    FiColumns, FiShare2, FiCreditCard, FiMail, FiInfo, FiUsers, FiZap, FiMenu
} from 'react-icons/fi';
import ImageUploaderWithLibrary from '../../components/ImageUploaderWithLibrary';
import AccessDenied from '../../../components/shared/AccessDenied';

const ManageContent = () => {
    const { content, loading: cmsLoading, updateContent, saveChanges } = useCMS();
    const { categories, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const [isUploading, setIsUploading] = useState(false);

    const handleFieldChange = (section, field, value) => {
        updateContent(section, field, value);
    };

    const handleListChange = (section, listKey, index, field, value) => {
        const list = content[section]?.[listKey] ? [...content[section][listKey]] : [];
        list[index] = { ...list[index], [field]: value };
        updateContent(section, listKey, list);
    };

    const handleAddItem = (section, listKey, newItem) => {
        const list = content[section]?.[listKey] ? [...content[section][listKey]] : [];
        const newList = [...list, newItem];
        updateContent(section, listKey, newList);
    };

    const handleRemoveItem = (section, listKey, index) => {
        const list = content[section]?.[listKey] ? [...content[section][listKey]] : [];
        const newList = list.filter((_, i) => i !== index);
        updateContent(section, listKey, newList);
    };

    if (authLoading || cmsLoading || shopLoading || !content) {
        return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500"/></div></PageTransition>;
    }
    
    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    const parentCategories = Object.keys(categories);

    return (
        <PageTransition>
            <div className="space-y-8">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FiEdit3 /> Content Management</h1>
                
                <form onSubmit={(e) => { e.preventDefault(); saveChanges(); }} className="space-y-6">
                    {/* Hero Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiHome /> Hero Section</h2>
                        <div className="space-y-4 p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-lg">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Main Banner(s)</h3>
                            {content.hero?.mainBanners?.map((banner, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <button type="button" onClick={() => handleRemoveItem('hero', 'mainBanners', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Headline</label><input type="text" value={banner.headline || ''} onChange={(e) => handleListChange('hero', 'mainBanners', index, 'headline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub-headline</label><input type="text" value={banner.subheadline || ''} onChange={(e) => handleListChange('hero', 'mainBanners', index, 'subheadline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label><input type="text" value={banner.buttonText || ''} onChange={(e) => handleListChange('hero', 'mainBanners', index, 'buttonText', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label><input type="text" value={banner.link || ''} onChange={(e) => handleListChange('hero', 'mainBanners', index, 'link', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <ImageUploaderWithLibrary currentImageUrl={banner.imageUrl} onImageChange={(newUrl) => handleListChange('hero', 'mainBanners', index, 'imageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading}/>
                                    {/* ✅ FIX: Added guidance for the main banner image size */}
                                    <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                        <FiInfo className="shrink-0 mt-0.5" />
                                        <span>For best results, upload a wide (landscape) image. Recommended size: <strong>1000px wide x 600px tall.</strong></span>
                                    </p>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('hero', 'mainBanners', { headline: '', subheadline: '', buttonText: '', link: '', imageUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Main Banner</button>
                        </div>
                        <div className="space-y-4 p-4 mt-6 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Sliding Side Banners</h3>
                             {content.hero?.sideBanners?.map((banner, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <button type="button" onClick={() => handleRemoveItem('hero', 'sideBanners', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={banner.title || ''} onChange={(e) => handleListChange('hero', 'sideBanners', index, 'title', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input type="text" value={banner.subtitle || ''} onChange={(e) => handleListChange('hero', 'sideBanners', index, 'subtitle', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Link Label (e.g., "Shop Now")</label><input type="text" value={banner.linkLabel || ''} onChange={(e) => handleListChange('hero', 'sideBanners', index, 'linkLabel', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Navigate to Page</label>
                                        <select value={banner.link || ''} onChange={(e) => handleListChange('hero', 'sideBanners', index, 'link', e.target.value)} className="w-full p-2 border rounded-md">
                                            <option value="" disabled>-- Select a Target --</option>
                                            <optgroup label="Categories">
                                                {parentCategories.map(catName => (<option key={catName} value={`/shop?parent=${encodeURIComponent(catName)}`}>{catName}</option>))}
                                            </optgroup>
                                            <optgroup label="Special Pages">
                                                <option value="/shop">All Products</option>
                                                <option value="/offers">Offers Page</option>
                                            </optgroup>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">This will automatically create a link to the selected page or category.</p>
                                    </div>
                                    <ImageUploaderWithLibrary currentImageUrl={banner.imageUrl} onImageChange={(newUrl) => handleListChange('hero', 'sideBanners', index, 'imageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading}/>
                                    {/* ✅ FIX: Added guidance for the side banner image size */}
                                    <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                        <FiInfo className="shrink-0 mt-0.5" />
                                        <span>For best results, upload a tall (portrait) image. Recommended size: <strong>400px wide x 600px tall.</strong></span>
                                    </p>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('hero', 'sideBanners', { title: '', subtitle: '', linkLabel: '', link: '', imageUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Side Banner</button>
                        </div>
                    </div>
                    
                    {/* Features Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiStar /> Features Section</h2>
                        <div className="space-y-4 p-4 border-l-4 border-green-500 bg-green-50/50 rounded-r-lg">
                            {content.features?.items?.map((item, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <button type="button" onClick={() => handleRemoveItem('features', 'items', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={item.title || ''} onChange={(e) => handleListChange('features', 'items', index, 'title', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={item.description || ''} onChange={(e) => handleListChange('features', 'items', index, 'description', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <ImageUploaderWithLibrary currentImageUrl={item.iconUrl} onImageChange={(newUrl) => handleListChange('features', 'items', index, 'iconUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Feature Icon"/>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('features', 'items', { title: '', description: '', iconUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Feature</button>
                        </div>
                    </div>
                    
                    {/* Category Spotlight Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTag /> Category Spotlight Section</h2>
                        <div className="space-y-4 p-4 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-lg">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Section Header</h3>
                            <div className="space-y-2 p-4 bg-white rounded-md">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label><input type="text" value={content.categorySpotlight?.title || ''} onChange={(e) => handleFieldChange('categorySpotlight', 'title', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input type="text" value={content.categorySpotlight?.subtitle || ''} onChange={(e) => handleFieldChange('categorySpotlight', 'subtitle', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            </div>
                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Spotlight Items</h3>
                            {content.categorySpotlight?.items?.map((item, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <button type="button" onClick={() => handleRemoveItem('categorySpotlight', 'items', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category to Link</label>
                                        <select value={item.link || ''} onChange={(e) => handleListChange('categorySpotlight', 'items', index, 'link', e.target.value)} className="w-full p-2 border rounded-md">
                                            <option value="" disabled>-- Select a Category --</option>
                                            {parentCategories.map(catName => (<option key={catName} value={`/shop?parent=${encodeURIComponent(catName)}`}>{catName}</option>))}
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Display Title (optional)</label><input type="text" value={item.title || ''} onChange={(e) => handleListChange('categorySpotlight', 'items', index, 'title', e.target.value)} className="w-full p-2 border rounded-md" placeholder="Defaults to category name"/></div>
                                    <ImageUploaderWithLibrary currentImageUrl={item.imageUrl} onImageChange={(newUrl) => handleListChange('categorySpotlight', 'items', index, 'imageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Category Image"/>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('categorySpotlight', 'items', { title: '', link: '', imageUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Spotlight Item</button>
                        </div>
                    </div>

                    {/* Header Settings Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiMenu /> Header Settings</h2>
                        <div className="space-y-4 p-4 border-l-4 border-slate-500 bg-slate-50/50 rounded-r-lg">
                            <ImageUploaderWithLibrary 
                                currentImageUrl={content.header?.logoUrl} 
                                onImageChange={(newUrl) => handleFieldChange('header', 'logoUrl', newUrl)} 
                                isUploading={isUploading} 
                                setIsUploading={setIsUploading}
                                label="Site Logo"
                            />
                        </div>
                    </div>
                    
                    {/* Navigation Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiNavigation /> Header Navigation</h2>
                        <div className="space-y-4 p-4 border-l-4 border-yellow-500 bg-yellow-50/50 rounded-r-lg">
                            {content.header?.navigation?.map((link, index) => (
                                <div key={index} className="flex items-end gap-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Name</label>
                                        <input type="text" value={link.name || ''} onChange={(e) => handleListChange('header', 'navigation', index, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Path</label>
                                        <input type="text" value={link.path || ''} onChange={(e) => handleListChange('header', 'navigation', index, 'path', e.target.value)} className="w-full p-2 border rounded-md" placeholder="/shop"/>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem('header', 'navigation', index)} className="p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('header', 'navigation', { name: '', path: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Nav Link</button>
                        </div>
                    </div>
                    
                    {/* Special Offer Banner Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiZap /> Special Offer Banner</h2>
                        <div className="space-y-6 p-4 border-l-4 border-teal-500 bg-teal-50/50 rounded-r-lg">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Default Content (when no campaign is active)</h3>
                            <div className="space-y-4 p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label><input type="text" value={content.specialOffer?.defaultTitle || ''} onChange={(e) => handleFieldChange('specialOffer', 'defaultTitle', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Headline</label><input type="text" value={content.specialOffer?.defaultHeadline || ''} onChange={(e) => handleFieldChange('specialOffer', 'defaultHeadline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Subheadline</label><textarea value={content.specialOffer?.defaultSubheadline || ''} onChange={(e) => handleFieldChange('specialOffer', 'defaultSubheadline', e.target.value)} rows="3" className="w-full p-2 border rounded-md"></textarea></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Button Text</label><input type="text" value={content.specialOffer?.defaultButtonText || ''} onChange={(e) => handleFieldChange('specialOffer', 'defaultButtonText', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            </div>
                            
                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Background Banners (Rotates)</h3>
                             {content.specialOffer?.backgroundBanners?.map((banner, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <button type="button" onClick={() => handleRemoveItem('specialOffer', 'backgroundBanners', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                    <ImageUploaderWithLibrary currentImageUrl={banner.imageUrl} onImageChange={(newUrl) => handleListChange('specialOffer', 'backgroundBanners', index, 'imageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading}/>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('specialOffer', 'backgroundBanners', { imageUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Background Banner</button>
                        </div>
                    </div>
                    
                    {/* About Page Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiInfo /> About Page Content</h2>
                        <div className="space-y-6 p-4 border-l-4 border-orange-500 bg-orange-50/50 rounded-r-lg">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Hero Section</h3>
                            <div className="space-y-4 p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label><input type="text" value={content.about?.heroHeadline || ''} onChange={(e) => handleFieldChange('about', 'heroHeadline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Hero Subheadline</label><textarea value={content.about?.heroSubheadline || ''} onChange={(e) => handleFieldChange('about', 'heroSubheadline', e.target.value)} rows="2" className="w-full p-2 border rounded-md"></textarea></div>
                                <ImageUploaderWithLibrary currentImageUrl={content.about?.heroImageUrl} onImageChange={(newUrl) => handleFieldChange('about', 'heroImageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Hero Background Image"/>
                            </div>
                            
                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Our Story Section</h3>
                            <div className="space-y-4 p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Story Title</label><input type="text" value={content.about?.storyTitle || ''} onChange={(e) => handleFieldChange('about', 'storyTitle', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Story Content</label><textarea value={content.about?.storyContent || ''} onChange={(e) => handleFieldChange('about', 'storyContent', e.target.value)} rows="5" className="w-full p-2 border rounded-md"></textarea></div>
                                <ImageUploaderWithLibrary currentImageUrl={content.about?.storyImageUrl} onImageChange={(newUrl) => handleFieldChange('about', 'storyImageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Story Image"/>
                            </div>

                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Core Values / Features Section</h3>
                            <div className="p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Features Headline</label><input type="text" value={content.about?.featuresHeadline || ''} onChange={(e) => handleFieldChange('about', 'featuresHeadline', e.target.value)} className="w-full p-2 border rounded-md mb-4"/></div>
                                {content.about?.features?.map((feature, index) => (
                                    <div key={index} className="space-y-3 p-3 border rounded-md relative bg-gray-50/80 shadow-sm mb-3">
                                        <button type="button" onClick={() => handleRemoveItem('about', 'features', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                            <select value={feature.icon || 'FaHeart'} onChange={(e) => handleListChange('about', 'features', index, 'icon', e.target.value)} className="w-full p-2 border rounded-md">
                                                <option value="FaTshirt">T-shirt Icon</option>
                                                <option value="FaGem">Gem Icon</option>
                                                <option value="FaHeart">Heart Icon</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={feature.title || ''} onChange={(e) => handleListChange('about', 'features', index, 'title', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text</label><input type="text" value={feature.text || ''} onChange={(e) => handleListChange('about', 'features', index, 'text', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddItem('about', 'features', { icon: 'FaHeart', title: '', text: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Feature</button>
                            </div>

                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Team Section</h3>
                             <div className="p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Team Headline</label><input type="text" value={content.about?.teamHeadline || ''} onChange={(e) => handleFieldChange('about', 'teamHeadline', e.target.value)} className="w-full p-2 border rounded-md mb-4"/></div>
                                {content.about?.teamMembers?.map((member, index) => (
                                    <div key={index} className="space-y-3 p-3 border rounded-md relative bg-gray-50/80 shadow-sm mb-3">
                                        <button type="button" onClick={() => handleRemoveItem('about', 'teamMembers', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={member.name || ''} onChange={(e) => handleListChange('about', 'teamMembers', index, 'name', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><input type="text" value={member.role || ''} onChange={(e) => handleListChange('about', 'teamMembers', index, 'role', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                        <ImageUploaderWithLibrary currentImageUrl={member.imageUrl} onImageChange={(newUrl) => handleListChange('about', 'teamMembers', index, 'imageUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Member Photo"/>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddItem('about', 'teamMembers', { name: '', role: '', imageUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Team Member</button>
                            </div>
                            
                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Call To Action Section</h3>
                             <div className="space-y-4 p-4 bg-white rounded-md border">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Headline</label><input type="text" value={content.about?.ctaHeadline || ''} onChange={(e) => handleFieldChange('about', 'ctaHeadline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Subheadline</label><input type="text" value={content.about?.ctaSubheadline || ''} onChange={(e) => handleFieldChange('about', 'ctaSubheadline', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label><input type="text" value={content.about?.ctaButtonText || ''} onChange={(e) => handleFieldChange('about', 'ctaButtonText', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Link</label><input type="text" value={content.about?.ctaButtonLink || ''} onChange={(e) => handleFieldChange('about', 'ctaButtonLink', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Page Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiMail /> Contact Page Content</h2>
                        <div className="space-y-4 p-4 border-l-4 border-cyan-500 bg-cyan-50/50 rounded-r-lg">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={content.contact?.address || ''} onChange={(e) => handleFieldChange('contact', 'address', e.target.value)} rows="3" className="w-full p-2 border rounded-md"></textarea></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="text" value={content.contact?.phone || ''} onChange={(e) => handleFieldChange('contact', 'phone', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" value={content.contact?.email || ''} onChange={(e) => handleFieldChange('contact', 'email', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label><input type="text" value={content.contact?.mapUrl || ''} onChange={(e) => handleFieldChange('contact', 'mapUrl', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiColumns /> Footer Content</h2>
                        <div className="space-y-4 p-4 border-l-4 border-gray-500 bg-gray-50/50 rounded-r-lg">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label><input type="text" value={content.footer?.copyrightText || ''} onChange={(e) => handleFieldChange('footer', 'copyrightText', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            
                            <hr className="my-4"/>
                            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2"><FiCreditCard /> Payment Icons</h3>
                            {content.footer?.paymentMethodIcons?.map((icon, index) => (
                               <div key={index} className="space-y-4 p-4 border rounded-md relative bg-white shadow-sm">
                                   <button type="button" onClick={() => handleRemoveItem('footer', 'paymentMethodIcons', index)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                   <div><label className="block text-sm font-medium text-gray-700 mb-1">Alt Text (e.g., "Visa")</label><input type="text" value={icon.altText || ''} onChange={(e) => handleListChange('footer', 'paymentMethodIcons', index, 'altText', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                   <ImageUploaderWithLibrary currentImageUrl={icon.iconUrl} onImageChange={(newUrl) => handleListChange('footer', 'paymentMethodIcons', index, 'iconUrl', newUrl)} isUploading={isUploading} setIsUploading={setIsUploading} label="Payment Icon"/>
                               </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('footer', 'paymentMethodIcons', { altText: '', iconUrl: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Payment Icon</button>

                            <hr className="my-4"/>
                            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2"><FiShare2 /> Social Media Links</h3>
                            {content.footer?.socialLinks?.map((link, index) => (
                                <div key={index} className="flex items-end gap-4 p-4 border rounded-md relative bg-white shadow-sm">
                                    <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Platform (e.g., "Facebook")</label><input type="text" value={link.platform || ''} onChange={(e) => handleListChange('footer', 'socialLinks', index, 'platform', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label><input type="text" value={link.url || ''} onChange={(e) => handleListChange('footer', 'socialLinks', index, 'url', e.target.value)} className="w-full p-2 border rounded-md"/></div>
                                    <button type="button" onClick={() => handleRemoveItem('footer', 'socialLinks', index)} className="p-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddItem('footer', 'socialLinks', { platform: '', url: '' })} className="flex items-center gap-2 text-sm mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiPlus /> Add Social Link</button>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                         <button 
                            type="submit" 
                            disabled={isUploading || !can('setting_edit')} 
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                           <FiSave /> Save All Changes
                         </button>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
};

export default ManageContent;