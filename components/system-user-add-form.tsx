import { useState, useRef, useLayoutEffect } from "react";

interface Props {
  onAdd: (user: {
    username: string;
    password: string;
    role: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  show: boolean;
}

export function SystemUserAddForm({
  onAdd,
  loading,
  error,
  onCancel,
  show,
}: Props) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Admin",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let timeout: NodeJS.Timeout;
    if (show) {
      setIsVisible(true);
      // Bước 1: set height về giá trị thực
      const content = node.querySelector("form");
      if (content) {
        const scrollH = (content as HTMLElement).scrollHeight + 32;
        setHeight(scrollH);
        // Bước 2: sau animation, set height về 'auto' để co giãn tự nhiên
        timeout = setTimeout(() => setHeight("auto"), 350);
      }
    } else {
      // Nếu đang là auto, phải set lại height thực trước khi về 0 để transition
      const content = node.querySelector("form");
      if (content) {
        const scrollH = (content as HTMLElement).scrollHeight + 32;
        setHeight(scrollH);
        // next tick mới set về 0 để trigger animation
        setTimeout(() => setHeight(0), 10);
      } else {
        setHeight(0);
      }
      timeout = setTimeout(() => setIsVisible(false), 350);
    }
    return () => clearTimeout(timeout);
  }, [show]);

  // Animation khi cancel: animate height về 0 rồi mới gọi onCancel
  const handleCancel = () => {
    const node = containerRef.current;
    if (node) {
      const content = node.querySelector("form");
      if (content) {
        const scrollH = (content as HTMLElement).scrollHeight + 32;
        setHeight(scrollH);
        setTimeout(() => setHeight(0), 10);
        setTimeout(() => {
          onCancel();
        }, 350);
        return;
      }
    }
    setHeight(0);
    setTimeout(() => {
      onCancel();
    }, 350);
  };

  const validate = () => {
    if (!form.username.trim()) return "Username is required.";
    if (form.username.length < 3)
      return "Username must be at least 3 characters.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      // Scroll to error if needed
      setTimeout(() => {
        const errorDiv = containerRef.current?.querySelector(
          ".system-user-form-error"
        );
        if (errorDiv) {
          errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
      return;
    }
    setFormError(null);
    await onAdd(form);
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        transition:
          typeof height === "number"
            ? "height 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms cubic-bezier(0.4,0,0.2,1)"
            : undefined,
        opacity: show ? 1 : 0,
        zIndex: 10,
        marginBottom: show ? 24 : 0,
        pointerEvents: show ? "auto" : "none",
        visibility: isVisible ? "visible" : "hidden",
      }}
      className="w-full flex justify-center"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-indigo-200 rounded-2xl p-8 flex flex-col gap-6 w-full max-w-4xl shadow-2xl mx-auto mt-4 transition-opacity duration-300"
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, username: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, password: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setForm({ ...form, role: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900"
            >
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
        {(formError || error) && (
          <div className="text-red-500 text-sm font-medium text-center system-user-form-error break-words max-h-32 min-h-[32px] overflow-y-auto">
            {formError || error}
          </div>
        )}
        <div className="flex gap-3 justify-end mt-2">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition shadow"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
