﻿using Cloudy.CMS.UI.FormSupport.ControlSupport.MatchingSupport.UIHintControlMappingSupport;
using Poetry.UI.FormSupport.UIHintSupport;
using System.Collections.Generic;

namespace Poetry.UI.FormSupport.ControlSupport.MatchingSupport.UIHintControlMappingSupport
{
    public interface IUIHintControlMatcher
    {
        UIHintControlMatch GetFor(UIHint uiHint);
    }
}