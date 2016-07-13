<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Block\System\Config;
use Magento\Framework\App\Config\ScopeConfigInterface;
class Version extends \Magento\Config\Block\System\Config\Form\Field
{
    private $moduleList;
    /**
     * Version constructor.
     */
    public function __construct(\Magento\Framework\Module\ModuleListInterface $moduleList,
                                \Magento\Backend\Block\Template\Context $contex,
                                array $data = []) {
        $this->moduleList = $moduleList;
        parent::__construct($contex, $data);

    }

    /**
     *
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        return $this->moduleList->getOne('HawkSearch_Proxy')['setup_version'];
    }
}
 