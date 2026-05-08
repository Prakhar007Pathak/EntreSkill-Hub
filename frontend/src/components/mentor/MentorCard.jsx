import { motion } from 'framer-motion';
import { Star, Users, Video, MessageSquare, MapPin, Clock } from 'lucide-react';

const MentorCard = ({ mentor, index, onClick }) => {
    const profile = mentor.mentorProfile || {};
    const initials = mentor.fullName
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, shadow: 'xl' }}
            onClick={onClick}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
        >
            {/* Card Top */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 relative">
                <div className="flex items-start justify-between">
                    {/* Avatar */}
                    <div className="relative">
                        {mentor.profilePicture ? (
                            <img
                                src={mentor.profilePicture}
                                alt={mentor.fullName}
                                className="w-16 h-16 rounded-2xl border-2 border-white/50 object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{initials}</span>
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
                    </div>

                    {/* Rating */}
                    {profile.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-lg">
                            <Star size={12} className="text-yellow-300 fill-yellow-300" />
                            <span className="text-white text-xs font-bold">
                                {profile.averageRating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Session type badges */}
                <div className="flex gap-2 mt-3">
                    {profile.sessionTypes?.qa && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                            <MessageSquare size={10} /> Q&A
                        </span>
                    )}
                    {profile.sessionTypes?.videoCall && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                            <Video size={10} /> Video Call
                        </span>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-0.5 group-hover:text-purple-600 transition-colors">
                    {mentor.fullName}
                </h3>
                <p className="text-purple-600 text-sm font-medium mb-2 line-clamp-1">
                    {profile.headline || profile.currentRole || 'Mentor'}
                </p>

                {/* Location */}
                {mentor.location?.city && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                        <MapPin size={12} />
                        <span>
                            {mentor.location.city}{mentor.location.country ? `, ${mentor.location.country}` : ''}
                        </span>
                    </div>
                )}

                {/* Bio */}
                {profile.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                {/* Expertise Tags */}
                {profile.primaryExpertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {profile.primaryExpertise.slice(0, 3).map((exp, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                            >
                                {exp}
                            </span>
                        ))}
                        {profile.primaryExpertise.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                +{profile.primaryExpertise.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Users size={12} className="text-purple-400" />
                            {profile.totalMentees || 0} mentees
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-400" />
                            {profile.yearsOfExperience || 0}y exp
                        </span>
                    </div>
                    <span className="text-purple-600 text-xs font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View Profile →
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default MentorCard;