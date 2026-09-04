"use client"

import { useState } from "react"
import { updatePasswordAction, updateProfileInfoAction } from "@/app/actions/user"
import { Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"
import { useSession } from "next-auth/react"

interface SettingsClientProps {
  userRole: string
  initialName: string
  initialEmail: string
  initialPhone?: string
}

export function SettingsClient({ userRole, initialName, initialEmail, initialPhone }: SettingsClientProps) {
  const { t } = useTranslation()
  const { update } = useSession()
  const [isPwdLoading, setIsPwdLoading] = useState(false)
  const [isProfLoading, setIsProfLoading] = useState(false)

  // Phone parsing
  const initialCC = initialPhone && initialPhone.startsWith("+") 
    ? (initialPhone.match(/^\+\d{1,4}/) || ["+250"])[0] 
    : "+250"
  const initialNumber = initialPhone ? initialPhone.replace(initialCC, "") : ""
  
  const [countryCode, setCountryCode] = useState(initialCC)
  const [phoneNumber, setPhoneNumber] = useState(initialNumber)

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsProfLoading(true)

    const formData = new FormData(e.currentTarget)
    const newName = formData.get("name") as string
    const newEmail = formData.get("email") as string
    const result = await updateProfileInfoAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success(result.message || "Profile updated successfully.")
      await update({ name: newName, email: newEmail }) // Sync session locally
    }
    
    setIsProfLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPwdLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePasswordAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success(result.message || "Password updated successfully.")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsPwdLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('settings_page.edit_profile')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('settings_page.profile_desc')}</p>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings_page.full_name')}</label>
            <input 
              required
              name="name"
              type="text" 
              defaultValue={initialName}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings_page.email')}</label>
            <input 
              required
              name="email"
              type="email" 
              defaultValue={initialEmail}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings_page.phone')}</label>
            <div className="flex items-center w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
              <select 
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-10 bg-transparent border-none text-sm font-medium focus:outline-none pl-2 max-w-[140px] truncate"
              >
                <option value="+213">+213 (Algeria)</option>
                <option value="+244">+244 (Angola)</option>
                <option value="+229">+229 (Benin)</option>
                <option value="+267">+267 (Botswana)</option>
                <option value="+226">+226 (Burkina Faso)</option>
                <option value="+257">+257 (Burundi)</option>
                <option value="+237">+237 (Cameroon)</option>
                <option value="+238">+238 (Cape Verde)</option>
                <option value="+236">+236 (Central African Republic)</option>
                <option value="+235">+235 (Chad)</option>
                <option value="+269">+269 (Comoros)</option>
                <option value="+242">+242 (Congo)</option>
                <option value="+243">+243 (DR Congo)</option>
                <option value="+253">+253 (Djibouti)</option>
                <option value="+20">+20 (Egypt)</option>
                <option value="+240">+240 (Equatorial Guinea)</option>
                <option value="+291">+291 (Eritrea)</option>
                <option value="+268">+268 (Eswatini)</option>
                <option value="+251">+251 (Ethiopia)</option>
                <option value="+241">+241 (Gabon)</option>
                <option value="+220">+220 (Gambia)</option>
                <option value="+233">+233 (Ghana)</option>
                <option value="+224">+224 (Guinea)</option>
                <option value="+245">+245 (Guinea-Bissau)</option>
                <option value="+225">+225 (Ivory Coast)</option>
                <option value="+254">+254 (Kenya)</option>
                <option value="+266">+266 (Lesotho)</option>
                <option value="+231">+231 (Liberia)</option>
                <option value="+218">+218 (Libya)</option>
                <option value="+261">+261 (Madagascar)</option>
                <option value="+265">+265 (Malawi)</option>
                <option value="+223">+223 (Mali)</option>
                <option value="+222">+222 (Mauritania)</option>
                <option value="+230">+230 (Mauritius)</option>
                <option value="+212">+212 (Morocco)</option>
                <option value="+258">+258 (Mozambique)</option>
                <option value="+264">+264 (Namibia)</option>
                <option value="+227">+227 (Niger)</option>
                <option value="+234">+234 (Nigeria)</option>
                <option value="+250">+250 (Rwanda)</option>
                <option value="+239">+239 (Sao Tome and Principe)</option>
                <option value="+221">+221 (Senegal)</option>
                <option value="+248">+248 (Seychelles)</option>
                <option value="+232">+232 (Sierra Leone)</option>
                <option value="+252">+252 (Somalia)</option>
                <option value="+27">+27 (South Africa)</option>
                <option value="+211">+211 (South Sudan)</option>
                <option value="+249">+249 (Sudan)</option>
                <option value="+255">+255 (Tanzania)</option>
                <option value="+228">+228 (Togo)</option>
                <option value="+216">+216 (Tunisia)</option>
                <option value="+256">+256 (Uganda)</option>
                <option value="+260">+260 (Zambia)</option>
                <option value="+263">+263 (Zimbabwe)</option>
              </select>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="781234567"
                className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none" 
              />
              <input type="hidden" name="phone" value={phoneNumber ? `${countryCode}${phoneNumber}` : ""} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isProfLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isProfLoading ? "..." : t('settings_page.update_profile')}
          </button>
        </form>
      </div>

      {userRole !== "CASHIER" && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('settings_page.security')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{t('settings_page.security_desc')}</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.current_pwd')}</label>
              <input 
                required
                name="currentPassword"
                type="password" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.new_pwd')}</label>
              <input 
                required
                name="newPassword"
                type="password" 
                placeholder="Minimum 6 characters"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.confirm_pwd')}</label>
              <input 
                required
                name="confirmPassword"
                type="password" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isPwdLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isPwdLoading ? "..." : t('settings_page.update_pwd')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
